package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.SalesReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesReportRepository extends JpaRepository<SalesReport, Integer> {
    // Find sales report by month and year
    @Query("SELECT sr FROM SalesReport sr WHERE sr.month = :month AND sr.year = :year")
    Optional<SalesReport> findByMonthAndYear(@Param("month") int month, @Param("year") int year);
    
    // Find all sales reports by year
    @Query("SELECT sr FROM SalesReport sr WHERE sr.year = :year ORDER BY sr.month")
    List<SalesReport> findByYear(@Param("year") int year);
    
    // Check if sales report exists for month and year
    @Query("SELECT CASE WHEN COUNT(sr) > 0 THEN true ELSE false END FROM SalesReport sr WHERE sr.month = :month AND sr.year = :year")
    boolean existsByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Calculate total revenue for a specific month and year
    @Query("SELECT COALESCE(SUM(sr.totalRevenue), 0) FROM SalesReport sr WHERE sr.month = :month AND sr.year = :year")
    double calculateTotalRevenue(@Param("month") int month, @Param("year") int year);

    // Calculate total revenue for a specific year
    @Query("SELECT COALESCE(SUM(sr.totalRevenue), 0) FROM SalesReport sr WHERE sr.year = :year")
    double calculateTotalRevenueByYear(@Param("year") int year);
}
