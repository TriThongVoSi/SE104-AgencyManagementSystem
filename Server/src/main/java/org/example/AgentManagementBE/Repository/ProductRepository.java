package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.Product;
import org.example.AgentManagementBE.Model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // Find product by ID with optional return
    Optional<Product> findById(Integer productId);
    
    // Find product by name
    Optional<Product> findByProductName(String productName);
    
    // Find product by name and unit
    Optional<Product> findByProductNameAndUnit(String productName, Unit unit);
    
    // Find products by name only (can return multiple products with different units)
    List<Product> findAllByProductName(String productName);
    
    // Get import price by product ID
    @Query("SELECT p.importPrice FROM Product p WHERE p.productId = :productId")
    Optional<Integer> findImportPriceById(@Param("productId") int productId);
    
    // Get export price by product ID
    @Query("SELECT p.exportPrice FROM Product p WHERE p.productId = :productId")
    Optional<Integer> findExportPriceById(@Param("productId") int productID);
    
    // Get all products
    List<Product> findAll();
    
    // Get inventory quantity by product name and unit
    @Query("SELECT p.inventoryQuantity FROM Product p WHERE p.productName = :productName AND p.unit.unitName = :unitName")
    Optional<Integer> findInventoryQuantityByNameAndUnit(@Param("productName") String productName, @Param("unitName") String unitName);
    
    // Get inventory quantity by product name (first found - for backward compatibility)
    @Query("SELECT p.inventoryQuantity FROM Product p WHERE p.productName = :productName")
    Optional<Integer> findInventoryQuantityByName(@Param("productName") String productName);
    
    // Check if product exists by name (for backward compatibility)
    boolean existsByProductName(String productName);
    
    // Check if product exists by name and unit
    boolean existsByProductNameAndUnit(String productName, Unit unit);
    
    // Check if product exists by name and unit name
    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.productName = :productName AND p.unit.unitName = :unitName")
    boolean existsByProductNameAndUnitName(@Param("productName") String productName, @Param("unitName") String unitName);
    
    // Check if product has any import details (used in transactions)
    @Query("SELECT COUNT(id) > 0 FROM ImportDetail id WHERE id.product.productId = :productId")
    boolean hasImportDetails(@Param("productId") Integer productId);
    
    // Check if product has any export details (used in transactions)  
    @Query("SELECT COUNT(ed) > 0 FROM ExportDetail ed WHERE ed.product.productId = :productId")
    boolean hasExportDetails(@Param("productId") Integer productId);
}
