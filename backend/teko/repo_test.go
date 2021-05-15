package main

import (
	reflect "reflect"
	pb "teko_service/proto"
	"testing"
)

func TestCreateCinema(t *testing.T) {
	repo := &Repository{}
	tables := []struct {
		numberOfRows int32
		numberOfColumns int32
		minDistance int32
		cinema *pb.Cinema
	}{
		{5, 5, 2,&pb.Cinema{MinimumDistance: 2, NumberOfColumns: 5, NumberOfRows: 5, ReservedSeats: []*pb.Seat{}}},
		{10, 15, 3, &pb.Cinema{MinimumDistance: 3, NumberOfColumns: 15, NumberOfRows: 10, ReservedSeats: []*pb.Seat{}}},
		{25, 25, 4, &pb.Cinema{MinimumDistance: 4, NumberOfColumns: 25, NumberOfRows: 25, ReservedSeats: []*pb.Seat{}}},
		{5, 3, 5,&pb.Cinema{MinimumDistance: 5, NumberOfColumns: 3, NumberOfRows: 5, ReservedSeats: []*pb.Seat{}}},
	}

	for _, table := range tables {
		cinema, err := repo.Create(table.numberOfRows, table.numberOfColumns, table.minDistance)
		if err != nil {
			t.Errorf("Getting error when creating table of size %d x %d", table.numberOfRows, table.numberOfColumns)
		}

		if !reflect.DeepEqual(*cinema, *table.cinema) {
			t.Errorf("Create wrong cinema, got: %+v, want: %+v", cinema, table.cinema)
		}
	}
}

func TestGetCinema(t *testing.T) {
	repo := &Repository{}
	_, err := repo.Create(10, 10, 2)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	cinema, err := repo.Get()

	expected := &pb.Cinema{MinimumDistance: 2, NumberOfColumns: 10, NumberOfRows: 10, ReservedSeats: []*pb.Seat{}}

	if err != nil {
		t.Errorf("Getting error when getting cinema")
	}

	if !reflect.DeepEqual(*cinema, *expected) {
		t.Errorf("Geting wrong cinema, got: %+v, want: %+v", *cinema, *expected)
	}
}

func TestConfigureCinema(t *testing.T) {
	repo := &Repository{}
	_, err := repo.Create(10, 10, 2)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	var seats []*pb.Seat
	seat := &pb.Seat{Row: 1, Column: 1}
	seats = append(seats, seat)

	_, err = repo.ReserveSeats(seats)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	cinema, err := repo.Configure(15, 15)
	if err != nil {
		t.Errorf("Getting error when configuring cinema")
	}

	if cinema.NumberOfRows != 15 || cinema.NumberOfColumns != 15 || !reflect.DeepEqual(seats, cinema.ReservedSeats) {
		t.Errorf("Configuring cinema wrongly")
	}

	cinema, err = repo.Configure(5, 5)
	if err != nil {
		t.Errorf("Getting error when configuring cinema")
	}

	if cinema.NumberOfRows != 5 || cinema.NumberOfColumns != 5 || !reflect.DeepEqual([]*pb.Seat{}, cinema.ReservedSeats) {
		t.Errorf("Configuring cinema wrongly")
	}
}

func TestChangeMinimumDistance(t *testing.T) {
	repo := &Repository{}
	_, err := repo.Create(10, 10, 2)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	var seats []*pb.Seat
	seat := &pb.Seat{Row: 1, Column: 1}
	seats = append(seats, seat)

	_, err = repo.ReserveSeats(seats)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	cinema, err := repo.ChangeMinimumDistance(3)
	if err != nil {
		t.Errorf("Getting error when changing minimum distance")
	}

	if cinema.MinimumDistance != 3 || !reflect.DeepEqual([]*pb.Seat{}, cinema.ReservedSeats) {
		t.Errorf("Changing minimum distance wrongly")
	}
}

func TestReserveSeats(t *testing.T) {
	repo := &Repository{}
	_, err := repo.Create(10, 10, 2)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	var seats []*pb.Seat
	seat := &pb.Seat{Row: 1, Column: 1}
	seats = append(seats, seat)
	seat = &pb.Seat{Row: 0, Column: 0}
	seats = append(seats, seat)

	cinema, err := repo.ReserveSeats(seats)
	if err != nil {
		t.Errorf("Getting error when setting up cinema")
	}

	if !reflect.DeepEqual(seats, cinema.ReservedSeats) {
		t.Errorf("Reserving seats wrongly")
	}

	// Test reserve reserved seats
	_, err = repo.ReserveSeats(seats)
	if err == nil {
		t.Errorf("Getting error when setting up cinema")
	}
}