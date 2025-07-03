package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDate;

@Entity
@Table(name = "PaymentReceipt")
public class PaymentReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    @ManyToOne
    @JoinColumn(name = "agent", nullable = false)
    private Agent agent;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "revenue", nullable = false)
    @DecimalMin(value = "0", inclusive = true, message = "Revenue must be greater than or equal to 0")
    private Integer revenue;

    public PaymentReceipt() {
    }

    public PaymentReceipt(Agent agent, LocalDate paymentDate, Integer revenue) {
        this.agent = agent;
        this.paymentDate = paymentDate;
        this.revenue = revenue;
    }

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public Agent getAgent() {
        return agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Integer getRevenue() {
        return revenue;
    }

    public void setRevenue(Integer revenue) {
        this.revenue = revenue;
    }
}
