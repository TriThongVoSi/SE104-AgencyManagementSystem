package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "ImportDetail")
public class ImportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "import_detail_id")
    private Integer importDetailId;

    @ManyToOne
    @JoinColumn(name = "import_receipt_id", nullable = false)
    private ImportReceipt importReceipt;

    @ManyToOne
    @JoinColumn(name = "product", nullable = false)
    private Product product;

    @Column(name = "quantity_import", nullable = false)
    private Integer quantityImport;

    @Column(name = "import_price", nullable = false)
    private Integer importPrice;

    @Column(name = "into_money", nullable = false)
    private Integer intoMoney;

    public ImportDetail() {
    }

    public ImportDetail(ImportReceipt importReceipt, Product product, Integer quantityImport, Integer importPrice) {
        this.importReceipt = importReceipt;
        this.product = product;
        this.quantityImport = quantityImport;
        this.importPrice = importPrice;
        this.intoMoney = quantityImport * importPrice;
    }

    public Integer getImportDetailId() {
        return importDetailId;
    }

    public void setImportDetailId(Integer importDetailId) {
        this.importDetailId = importDetailId;
    }

    public ImportReceipt getImportReceipt() {
        return importReceipt;
    }

    public void setImportReceipt(ImportReceipt importReceipt) {
        this.importReceipt = importReceipt;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantityImport() {
        return quantityImport;
    }

    public void setQuantityImport(Integer quantityImport) {
        this.quantityImport = quantityImport;
        if (this.importPrice != null) {
            this.intoMoney = this.quantityImport * this.importPrice;
        }
    }

    public Integer getImportPrice() {
        return importPrice;
    }

    public void setImportPrice(Integer importPrice) {
        this.importPrice = importPrice;
        if (this.quantityImport != null) {
            this.intoMoney = this.quantityImport * this.importPrice;
        }
    }

    public Integer getIntoMoney() {
        return intoMoney;
    }

    public void setIntoMoney(Integer intoMoney) {
        this.intoMoney = intoMoney;
    }
}