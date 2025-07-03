package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.ImportReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImportReceiptRepository extends JpaRepository<ImportReceipt, Integer> {
    // Find import receipt by ID
    Optional<ImportReceipt> findById(Integer importReceiptId);
    
    // Find import receipts by date
    @Query("SELECT ir FROM ImportReceipt ir WHERE ir.createDate = :createDate")
    List<ImportReceipt> findByCreateDate(@Param("createDate") LocalDate createDate);
    
    // Find import receipts by month and year
    @Query("SELECT ir FROM ImportReceipt ir WHERE MONTH(ir.createDate) = :month AND YEAR(ir.createDate) = :year")
    List<ImportReceipt> findByMonthAndYear(@Param("month") int month, @Param("year") int year);
    
    // Get total import amount by month and year
    @Query("SELECT COALESCE(SUM(ir.totalAmount), 0) FROM ImportReceipt ir WHERE MONTH(ir.createDate) = :month AND YEAR(ir.createDate) = :year")
    Integer getTotalMoneyByMonthAndYear(@Param("month") int month, @Param("year") int year);
    
    // Calculate total money of an import receipt
    @Query("SELECT COALESCE(SUM(id.quantityImport * id.importPrice), 0) FROM ImportDetail id WHERE id.importReceipt.importReceiptId = :importReceiptId")
    Integer calculateTotalMoney(@Param("importReceiptId") Integer importReceiptId);
    
    // Update only totalAmount of ImportReceipt
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE ImportReceipt ir SET ir.totalAmount = :totalAmount WHERE ir.importReceiptId = :importReceiptId")
    void updateTotalAmount(@Param("importReceiptId") Integer importReceiptId, @Param("totalAmount") Integer totalAmount);
}

