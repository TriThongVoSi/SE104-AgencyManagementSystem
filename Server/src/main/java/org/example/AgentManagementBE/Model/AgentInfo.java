package org.example.AgentManagementBE.Model;

public class AgentInfo 
{
    private Integer agentId;
    private String agentName;
    private String agentTypeName;
    private String districtName;
    private Double debtMoney;

    public AgentInfo(Integer agentId, String agentName, String agentTypeName, String districtName, Double debtMoney) 
    {
        this.agentId = agentId;
        this.agentName = agentName;
        this.agentTypeName = agentTypeName;
        this.districtName = districtName;
        this.debtMoney = debtMoney;
    }

    public Integer getAgentId() 
    {
        return agentId;
    }

    public void setAgentId(Integer agentId) 
    {
        this.agentId = agentId;
    }

    public String getAgentName() 
    {
        return agentName;
    }

    public void setAgentName(String agentName) 
    {
        this.agentName = agentName;
    }

    public String getAgentTypeName() 
    {
        return agentTypeName;
    }

    public void setAgentTypeName(String agentTypeName) 
    {
        this.agentTypeName = agentTypeName;
    }

    public String getDistrictName() 
    {
        return districtName;
    }

    public void setDistrictName(String districtName) 
    {
        this.districtName = districtName;
    }

    public Double getDebtMoney() 
    {
        return debtMoney;
    }

    public void setDebtMoney(Double debtMoney) 
    {
        this.debtMoney = debtMoney;
    }
}