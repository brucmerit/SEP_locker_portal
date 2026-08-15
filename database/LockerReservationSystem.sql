CREATE DATABASE LockerReservationSystem;
GO

USE LockerReservationSystem;
GO

-- ============================================
-- Table: LockerStation
-- Each row = one physical location with lockers
-- ============================================
CREATE TABLE LockerStation (
    StationID       INT             PRIMARY KEY,
    StationName     VARCHAR(100)    NOT NULL,
    Address         VARCHAR(200)    NOT NULL,
    TotalLockers    INT             NOT NULL,
    ImageUrl        VARCHAR(300)    NULL
);

-- ============================================
-- Table: Locker
-- Each row = one locker that belongs to a station
-- ============================================
CREATE TABLE Locker (
    LockerID        INT             PRIMARY KEY,
    StationID       INT             NOT NULL,
    LockerNumber    VARCHAR(10)     NOT NULL,
    Size            VARCHAR(20)     NOT NULL,   -- Small / Medium / Large
    Status          VARCHAR(20)     NOT NULL,   -- Available / Reserved / Occupied

    CONSTRAINT FK_Locker_Station FOREIGN KEY (StationID)
        REFERENCES LockerStation(StationID),

    CONSTRAINT CK_Locker_Size CHECK (Size IN ('Small','Medium','Large')),
    CONSTRAINT CK_Locker_Status CHECK (Status IN ('Available','Reserved','Occupied')),
    CONSTRAINT UQ_Locker_StationNumber UNIQUE (StationID, LockerNumber)
);

-- ============================================
-- Table: Reservation
-- Each row = one locker reservation made by a member of the public
-- No login required - identified by MobileNumber + PIN only
-- ============================================
CREATE TABLE Reservation (
    ReservationID     INT             PRIMARY KEY,
    LockerID          INT             NOT NULL,
    MobileNumber      VARCHAR(8)      NOT NULL,
    PinHash           VARCHAR(200)    NOT NULL,   -- hashed PIN, never stored as plain text
    ReservationCode   VARCHAR(10)     NOT NULL,
    ReservationTime   DATETIME        NOT NULL DEFAULT GETDATE(),
    ExpiryTime        DATETIME        NOT NULL,
    Status            VARCHAR(20)     NOT NULL DEFAULT 'Active',

    CONSTRAINT FK_Reservation_Locker FOREIGN KEY (LockerID)
        REFERENCES Locker(LockerID),

    CONSTRAINT CK_Reservation_Status CHECK (Status IN ('Active','Cancelled','Completed','Expired')),
    CONSTRAINT UQ_Reservation_Code UNIQUE (ReservationCode)
);
GO

-- ============================================
-- Seed data - sample stations and lockers so the
-- prototype has something to display right away.
-- ImageUrl uses picsum.photos (a free placeholder photo
-- service) seeded by station name, so each station gets
-- a consistent, distinct photo without needing real assets.
-- ============================================

INSERT INTO LockerStation (StationID, StationName, Address, TotalLockers, ImageUrl)
VALUES
(1, 'Sengkang Community Hub', '2 Sengkang Square, Singapore', 8, 'https://picsum.photos/seed/sengkang-hub/800/500'),
(2, 'Compass One Mall', '1 Sengkang Square, Singapore', 6, 'https://picsum.photos/seed/compass-one/800/500'),
(3, 'Punggol Waterway Point', '83 Punggol Central, Singapore', 10, 'https://picsum.photos/seed/waterway-point/800/500');

INSERT INTO Locker (LockerID, StationID, LockerNumber, Size, Status)
VALUES
-- Station 1
(1, 1, 'A01', 'Small', 'Available'),
(2, 1, 'A02', 'Small', 'Available'),
(3, 1, 'A03', 'Medium', 'Reserved'),
(4, 1, 'A04', 'Medium', 'Available'),
(5, 1, 'A05', 'Large', 'Occupied'),
(6, 1, 'A06', 'Medium', 'Available'),
(7, 1, 'A07', 'Small', 'Available'),
(8, 1, 'A08', 'Large', 'Available'),

-- Station 2
(9, 2, 'B01', 'Small', 'Available'),
(10, 2, 'B02', 'Medium', 'Occupied'),
(11, 2, 'B03', 'Medium', 'Available'),
(12, 2, 'B04', 'Large', 'Available'),
(13, 2, 'B05', 'Small', 'Reserved'),
(14, 2, 'B06', 'Medium', 'Available'),

-- Station 3
(15, 3, 'C01', 'Small', 'Available'),
(16, 3, 'C02', 'Small', 'Available'),
(17, 3, 'C03', 'Medium', 'Available'),
(18, 3, 'C04', 'Medium', 'Reserved'),
(19, 3, 'C05', 'Large', 'Available'),
(20, 3, 'C06', 'Large', 'Occupied'),
(21, 3, 'C07', 'Medium', 'Available'),
(22, 3, 'C08', 'Small', 'Available'),
(23, 3, 'C09', 'Medium', 'Available'),
(24, 3, 'C10', 'Small', 'Available');
GO
