package org.example.AgentManagementBE.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "AgentType")
public class AgentType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agent_type_id")
    private Integer agentTypeId;

    @NotBlank(message = "Agent type name is required")
    @Column(name = "agent_type_name", nullable = false, unique = true)
    private String agentTypeName;

    @Positive(message = "Maximum debt must be positive")
    @Column(name = "max_debt", nullable = false)
    private Integer maximumDebt;

    @OneToMany(mappedBy = "agentType")
    @JsonIgnore
    private List<Agent> agents = new ArrayList<>();

    public AgentType() {
    }

    public AgentType(String agentTypeName, Integer maximumDebt) {
        this.agentTypeName = agentTypeName;
        this.maximumDebt = maximumDebt;
    }

    public Integer getAgentTypeId() {
        return agentTypeId;
    }

    public void setAgentTypeId(Integer agentTypeId) {
        this.agentTypeId = agentTypeId;
    }

    public String getAgentTypeName() {
        return agentTypeName;
    }

    public void setAgentTypeName(String agentTypeName) {
        this.agentTypeName = agentTypeName;
    }

    public Integer getMaximumDebt() {
        return maximumDebt;
    }

    public void setMaximumDebt(Integer maximumDebt) {
        this.maximumDebt = maximumDebt;
    }

    public List<Agent> getAgents() {
        return agents;
    }

    public void setAgents(List<Agent> agents) {
        this.agents = agents;
    }
}
