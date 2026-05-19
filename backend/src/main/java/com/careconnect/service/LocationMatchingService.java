package com.careconnect.service;

import com.careconnect.entity.EmergencyRequest;
import com.careconnect.entity.RequestStatus;
import com.careconnect.repository.EmergencyRequestRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LocationMatchingService {

    private final EmergencyRequestRepository emergencyRequestRepository;

    @Value("${careconnect.matching.default-radius-km:10}")
    private double defaultRadiusKm;

    public LocationMatchingService(EmergencyRequestRepository emergencyRequestRepository) {
        this.emergencyRequestRepository = emergencyRequestRepository;
    }

    public List<EmergencyRequest> findNearbyRequests(double latitude, double longitude, Double radiusKm) {
        double radius = (radiusKm != null && radiusKm > 0) ? radiusKm : defaultRadiusKm;

        List<String> statusNames = List.of(
                RequestStatus.OPEN.name(),
                RequestStatus.PARTIALLY_FILLED.name()
        );

        return emergencyRequestRepository.findNearbyByLocation(latitude, longitude, radius, statusNames);
    }

    /**
     * Utility method retained for callers that need approximate distance
     * calculations outside of the database query layer.
     */
    public double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Returns true if the staff should be treated as eligible for notifications:
     * - If either the staff or request location is missing, we include them.
     * - If both have coordinates, we include them only if within the given radius.
     */
    public boolean isWithinRadiusOrNoLocation(Double staffLat,
                                              Double staffLng,
                                              Double requestLat,
                                              Double requestLng,
                                              double radiusKm) {
        if (staffLat == null || staffLng == null || requestLat == null || requestLng == null) {
            return true;
        }
        return distanceKm(staffLat, staffLng, requestLat, requestLng) <= radiusKm;
    }
}
