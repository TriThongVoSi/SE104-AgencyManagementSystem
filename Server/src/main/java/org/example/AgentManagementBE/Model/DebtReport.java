package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "DebtReport")
public class DebtReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "debt_report_id")
    private Integer debtReportId;

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(name = "year", nullable = false)
    private Integer year;

    @ManyToOne
    @JoinColumn(name = "agent", nullable = false)
    private Agent agent;

    @Column(name = "first_debt", nullable = false)
    private Integer firstDebt;

    @Column(name = "arisen_debt", nullable = false)
    private Integer arisenDebt;

    @Column(name = "last_debt", nullable = false)
    private Integer lastDebt;

    public DebtReport() {
    }

    public DebtReport(Integer month, Integer year, Agent agent) {
        this.month = month;
        this.year = year;
        this.agent = agent;
        this.firstDebt = agent.getDebtMoney() != null ? agent.getDebtMoney() : 0;
        this.arisenDebt = 0;
        this.lastDebt = agent.getDebtMoney() != null ? agent.getDebtMoney() : 0;
    }

    public Integer getDebtReportId() {
        return debtReportId;
    }

    public void setDebtReportId(Integer debtReportId) {
        this.debtReportId = debtReportId;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Agent getAgent() {
        return agent;
    }

    public void setAgent(Agent agent) {
        this.agent = agent;
    }

    public Integer getFirstDebt() {
        return firstDebt;
    }

    public void setFirstDebt(Integer firstDebt) {
        this.firstDebt = firstDebt;
    }

    public Integer getArisenDebt() {
        return arisenDebt;
    }

    public void setArisenDebt(Integer arisenDebt) {
        this.arisenDebt = arisenDebt;
    }

    public Integer getLastDebt() {
        return lastDebt;
    }

    public void setLastDebt(Integer lastDebt) {
        this.lastDebt = lastDebt;
    }
}
