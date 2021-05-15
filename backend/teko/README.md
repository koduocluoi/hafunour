# Teko: Cinema Service

## MVP Assumptions
1. For this MVP, we only support one cinema which is initialized 
with 10x10 (minimum distance = 2 ) when spinning up the server. 
However, we can easily implement that feature
by adding cinemaId.
2. We don't have any database for this MVP. Cinema information will be stored on 
process's memory, which will be cleared when we stop the local server. 
3. Row/column indexes start with 0. 
4. When we reduce cinema size / change minimum distance, we also cancel all reservations. Increase cinema size won't 
affect reserved seats. 
5. Sitting together means sitting in the same row.
6. I have unittest for the repository which handles most of business logic. 
I didn't add service tests as I think unittest is good enough for this small service 
as we will test it manually by trying to run procedures.

## Design and TradeOff
- As you might notice I use O(n*m*k) which n*m = cinema size and k is the number of seats
when updating available seat map. I considered between O(n*m*d) as d = mininum distance with my solution,
but I choose my solution because:
1. Real cases will have small k (~5 -> 10)
2. As more seats being reserved, the function run faster as more seats filled = less 
seats needed to check

## Other notes
- I use Yodelay.io as a GUI to test gRPC service 
