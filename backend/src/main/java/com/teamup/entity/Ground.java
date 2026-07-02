package com.teamup.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "grounds")
public class Ground {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String sportsAvailable; // Comma separated list: "Football, Basketball"

    private String contactNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    private Double hourlyPrice = 1200.0; // Default price

    @Lob
    private String availableSlots = "06:00-07:00,07:00-08:00,08:00-09:00,09:00-10:00,16:00-17:00,17:00-18:00,18:00-19:00,19:00-20:00,20:00-21:00,21:00-22:00"; // Comma-separated slots

    @Lob
    private String cancellationPolicy = "Cancel more than 6 hours before match for 100% refund. Otherwise, booking locked with no cancellation.";

    public Ground() {}

    public Ground(String name, String address, Double latitude, Double longitude, String sportsAvailable, String contactNumber, User owner) {
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.sportsAvailable = sportsAvailable;
        this.contactNumber = contactNumber;
        this.owner = owner;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getSportsAvailable() { return sportsAvailable; }
    public void setSportsAvailable(String sportsAvailable) { this.sportsAvailable = sportsAvailable; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public Double getHourlyPrice() { return hourlyPrice; }
    public void setHourlyPrice(Double hourlyPrice) { this.hourlyPrice = hourlyPrice; }

    public String getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(String availableSlots) { this.availableSlots = availableSlots; }

    public String getCancellationPolicy() { return cancellationPolicy; }
    public void setCancellationPolicy(String cancellationPolicy) { this.cancellationPolicy = cancellationPolicy; }
}
