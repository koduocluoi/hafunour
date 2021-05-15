package main

import (
	"context"
	"errors"
	"fmt"
	"google.golang.org/grpc"
	"log"
	"net"
	"sync"
	pb "teko_service/proto"
)

const (
	port = ":1355"
)

type repository interface {
	Create(int32, int32, int32) (*pb.Cinema, error)
	Get() (*pb.Cinema, error)
	Configure(int32, int32)  (*pb.Cinema, error)
	ChangeMinimumDistance(int32) (*pb.Cinema, error)
	ReserveSeats([]*pb.Seat) (*pb.Cinema, error)
	FindAvailableSeats(int32) ([]*pb.Seat, error)
	UpdateAvailableMap([]*pb.Seat) error
}

type Repository struct {
	mu	sync.RWMutex
	cinema	*pb.Cinema
	availableSeatMap []bool
}

type service struct {
	repo repository
}

func Abs(x int32) int32 {
	if x < 0 {
		return -x
	}

	return x
}

func (repo *Repository) UpdateAvailableMap(seats []*pb.Seat) error {
	var i int32
	var j int32
	numberOfRows := repo.cinema.NumberOfRows
	numberOfColumns := repo.cinema.NumberOfColumns
	minDistance := repo.cinema.MinimumDistance

	for i = 0; i < numberOfRows; i++ {
		for j = 0; j < numberOfColumns; j++ {
			if !repo.availableSeatMap[i * numberOfColumns + j] {
				for _, v := range seats {
					if Abs(i - v.Row) + Abs(j - v.Column) <= minDistance {
						repo.availableSeatMap[i * numberOfColumns + j] = true
						break
					}
				}
			}
		}
	}

	return nil
}

// Create new Cinema
func (repo *Repository) Create(numberOfRows, numberOfColumns, minimumDistance int32) (*pb.Cinema, error) {
	repo.mu.Lock()
	repo.cinema = &pb.Cinema{
		NumberOfColumns: numberOfColumns,
		NumberOfRows: numberOfRows,
		MinimumDistance: minimumDistance,
		ReservedSeats: []*pb.Seat{},
	}
	repo.availableSeatMap = make([]bool, numberOfColumns * numberOfRows)
	repo.mu.Unlock()
	return repo.cinema, nil
}

func (repo *Repository) Get() (*pb.Cinema, error) {
	return repo.cinema, nil
}

func (repo *Repository) Configure(newNumberOfRows, newNumberOfColumns int32) (*pb.Cinema, error) {
	// If we reduce number of rows / columns or change minimum distance, we will release all the reserved seats.
	// Otherwise, keep all the reserved seats, just change the size.
	if newNumberOfRows < repo.cinema.NumberOfRows || newNumberOfColumns < repo.cinema.NumberOfColumns {
		repo.cinema.NumberOfColumns = newNumberOfColumns
		repo.cinema.NumberOfRows = newNumberOfRows
		repo.cinema.ReservedSeats =  []*pb.Seat{}
	} else {
		repo.cinema.NumberOfColumns = newNumberOfColumns
		repo.cinema.NumberOfRows = newNumberOfRows
	}

	repo.availableSeatMap = make([]bool, newNumberOfColumns * newNumberOfRows)
	err := repo.UpdateAvailableMap(repo.cinema.ReservedSeats)
	if err != nil {
		log.Fatalf("Error updating available seat map: %v", err)
	}

	return repo.cinema, nil
}

func (repo *Repository) ChangeMinimumDistance(minDistance int32) (*pb.Cinema, error) {
	// If we reduce number of rows / columns or change minimum distance, we will release all the reserved seats.
	repo.cinema.ReservedSeats =  []*pb.Seat{}
	repo.cinema.MinimumDistance = minDistance

	repo.availableSeatMap = make([]bool, repo.cinema.NumberOfColumns * repo.cinema.NumberOfRows)
	err := repo.UpdateAvailableMap(repo.cinema.ReservedSeats)
	if err != nil {
		log.Fatalf("Error updating available seat map: %v", err)
	}

	return repo.cinema, nil
}

func (repo *Repository) FindAvailableSeats(numberOfSeats int32) ([]*pb.Seat, error) {
	// Validate request
	if numberOfSeats == 0 {
		return []*pb.Seat{}, nil
	}

	var count int32 = 0
	numberOfColumns := repo.cinema.NumberOfColumns
	seatMap := repo.availableSeatMap

	var i int32
	var j int32
	for i = 0; i < repo.cinema.NumberOfRows; i++ {
		count = 0
		for j = 0; j < numberOfColumns; j ++ {
			if seatMap[i * numberOfColumns + j] {
				count = 0
			} else {
				count += 1
			}

			if count == numberOfSeats {
				var seats []*pb.Seat
				for k := j - count + 1; k <= j; k++ {
					seat := &pb.Seat{Row: i, Column: k}
					seats = append(seats, seat)
				}

				return seats, nil
			}
		}
	}

	return []*pb.Seat{}, nil
}

func (repo *Repository) ReserveSeats(seats []*pb.Seat) (*pb.Cinema, error) {
	// Validate request: Seat should be available to be reserve
	for _, v := range seats {
		if repo.availableSeatMap[v.Row * repo.cinema.NumberOfColumns + v.Column] {
			return nil, errors.New("can't reserve reserved seats")
		}
	}

	repo.cinema.ReservedSeats = append(repo.cinema.ReservedSeats, seats...)
	err := repo.UpdateAvailableMap(seats)
	if err != nil {
		log.Fatalf("Error updating available seat map: %v", err)
	}
	return repo.cinema, nil
}

func (s *service) GetCinema(ctx context.Context, req *pb.GetCinemaRequest) (*pb.GetCinemaResponse, error) {
	cinema, err := s.repo.Get()

	if err != nil {
		response := &pb.GetCinemaResponse{
			Status: &pb.Status{Code: 500, Message: fmt.Sprintf("Error when getting all cinemas: %v", err)},
			Cinema: nil,
		}

		return response, err
	}

	response := &pb.GetCinemaResponse{
		Status: &pb.Status{Code: 200, Message: "Successful"},
		Cinema: cinema,
	}
	return response, nil
}

func (s *service) ConfigureCinemaSize(ctx context.Context, req *pb.ConfigureCinemaSizeRequest) (*pb.ConfigureCinemaSizeResponse, error) {
	cinema, err := s.repo.Configure(req.NewNumberOfRows, req.NewNumberOfColumns)

	if err != nil {
		response := &pb.ConfigureCinemaSizeResponse{
			Status: &pb.Status{Code: 500, Message: fmt.Sprintf("Error when configuring contests: %v", err)},
			UpdatedCinema: nil,
		}
		return response, err
	}

	response := &pb.ConfigureCinemaSizeResponse{
		Status: &pb.Status{Code: 200, Message: "Success"},
		UpdatedCinema: cinema,
	}

	return response, nil
}

func (s *service) FindAvailableSeats(ctx context.Context, req *pb.FindAvailableSeatsRequest) (*pb.FindAvailableSeatsResponse, error) {
	seats, err := s.repo.FindAvailableSeats(req.NumberOfSeats)

	if err != nil {
		response := &pb.FindAvailableSeatsResponse{
			Status: &pb.Status{Code: 500, Message: fmt.Sprintf("Error when find available seats: %v", err)},
			Seats: nil,
		}
		return response, err
	}

	response := &pb.FindAvailableSeatsResponse{
		Status: &pb.Status{Code: 200, Message: "Success"},
		Seats: seats,
	}

	return response, nil
}

func (s *service) ReserveSeats(ctx context.Context, req *pb.ReserveSeatsRequest) (*pb.ReserveSeatsResponse, error) {
	_, err := s.repo.ReserveSeats(req.Seats)

	if err != nil {
		response := &pb.ReserveSeatsResponse{
			Status: &pb.Status{Code: 500, Message: fmt.Sprintf("Error when reserving seats: %v", err)},
		}
		return response, err
	}

	response := &pb.ReserveSeatsResponse{
		Status: &pb.Status{Code: 200, Message: "Success"},
	}

	return response, nil
}

func (s *service) ChangeMinimumDistance(ctx context.Context, req *pb.ChangeMinimumDistanceRequest) (*pb.ChangeMinimumDistanceResponse, error) {
	_, err := s.repo.ChangeMinimumDistance(req.MinimumDistance)

	if err != nil {
		response := &pb.ChangeMinimumDistanceResponse{
			Status: &pb.Status{Code: 500, Message: fmt.Sprintf("Error when updating minimum distance: %v", err)},
		}
		return response, err
	}

	response := &pb.ChangeMinimumDistanceResponse{
		Status: &pb.Status{Code: 200, Message: "Success"},
	}

	return response, nil
}

func main() {
	repo := &Repository{}
	_, err := repo.Create(10, 10, 2)
	if err != nil {
		log.Fatalf("Error when init a cinema: %v", err)
	}

	log.Println("Successfully init a cinema with size 10x10")

	lis, err := net.Listen("tcp", port)

	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}

	s := grpc.NewServer()

	pb.RegisterTekoServiceServer(s, &service{repo})

	log.Println("Running on port", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
