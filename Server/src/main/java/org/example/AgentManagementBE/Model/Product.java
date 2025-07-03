package org.example.AgentManagementBE.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Product", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_name", "unit"}))
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @NotBlank(message = "Product name is required")
    @Column(name = "product_name", nullable = false)
    private String productName;

    @ManyToOne
    @JoinColumn(name = "unit", nullable = false)
    private Unit unit;

    @NotNull(message = "Import price is required")
    @Positive(message = "Import price must be positive")
    @Column(name = "import_price", nullable = false)
    private Integer importPrice;

    @NotNull(message = "Export price is required")
    @Positive(message = "Export price must be positive")
    @Column(name = "export_price", nullable = false)
    private Integer exportPrice;

    @Column(name = "inventory_quantity", nullable = false)
    private Integer inventoryQuantity = 0;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ImportDetail> importDetails = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ExportDetail> exportDetails = new ArrayList<>();

    public Product() {
    }

    public Product(String productName, Unit unit, Integer importPrice, Integer exportPrice) {
        this.productName = productName;
        this.unit = unit;
        this.importPrice = importPrice;
        this.exportPrice = exportPrice;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Unit getUnit() {
        return unit;
    }

    public void setUnit(Unit unit) {
        this.unit = unit;
    }

    public Integer getImportPrice() {
        return importPrice;
    }

    public void setImportPrice(Integer importPrice) {
        this.importPrice = importPrice;
    }

    public Integer getExportPrice() {
        return exportPrice;
    }

    public void setExportPrice(Integer exportPrice) {
        this.exportPrice = exportPrice;
    }

    public Integer getInventoryQuantity() {
        return inventoryQuantity;
    }

    public void setInventoryQuantity(Integer inventoryQuantity) {
        this.inventoryQuantity = inventoryQuantity;
    }

    
    public List<ImportDetail> getImportDetails() {
        return importDetails;
    }

    public void setImportDetails(List<ImportDetail> importDetails) {
        this.importDetails = importDetails;
    }

    public List<ExportDetail> getExportDetails() {
        return exportDetails;
    }

    public void setExportDetails(List<ExportDetail> exportDetails) {
        this.exportDetails = exportDetails;
    }
}