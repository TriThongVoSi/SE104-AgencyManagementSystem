package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "ExportDetail")
public class ExportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "export_detail_id")
    private Integer exportDetailId;

    @ManyToOne
    @JoinColumn(name = "export_receipt_id", nullable = false)
    private ExportReceipt exportReceipt;

    @ManyToOne
    @JoinColumn(name = "product", nullable = false)
    private Product product;

    @Column(name = "quantity_export", nullable = false)
    private Integer quantityExport;

    @Column(name = "export_price", nullable = false)
    private Integer exportPrice;

    @Column(name = "into_money", nullable = false)
    private Integer intoMoney;

    public ExportDetail() {
    }

    public ExportDetail(ExportReceipt exportReceipt, Product product, Integer quantityExport, Integer exportPrice) {
        this.exportReceipt = exportReceipt;
        this.product = product;
        this.quantityExport = quantityExport;
        this.exportPrice = exportPrice;
        this.intoMoney = quantityExport * exportPrice;
    }

    public Integer getExportDetailId() {
        return exportDetailId;
    }

    public void setExportDetailId(Integer exportDetailId) {
        this.exportDetailId = exportDetailId;
    }

    public ExportReceipt getExportReceipt() {
        return exportReceipt;
    }

    public void setExportReceipt(ExportReceipt exportReceipt) {
        this.exportReceipt = exportReceipt;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantityExport() {
        return quantityExport;
    }

    public void setQuantityExport(Integer quantityExport) {
        this.quantityExport = quantityExport;
        if (this.exportPrice != null) {
            this.intoMoney = this.quantityExport * this.exportPrice;
        }
    }

    public Integer getExportPrice() {
        return exportPrice;
    }

    public void setExportPrice(Integer exportPrice) {
        this.exportPrice = exportPrice;
        if (this.quantityExport != null) {
            this.intoMoney = this.quantityExport * this.exportPrice;
        }
    }

    public Integer getIntoMoney() {
        return intoMoney;
    }

    public void setIntoMoney(Integer intoMoney) {
        this.intoMoney = intoMoney;
    }
}
