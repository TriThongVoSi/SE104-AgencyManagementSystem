package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "Parameter")
public class Parameter {
    @Id
    @Column(name = "param_key", length = 100)
    private String paramKey;

    @Column(name = "param_value", nullable = false, columnDefinition = "TEXT")
    private String paramValue;

    @Column(name = "param_description", columnDefinition = "TEXT")
    private String paramDescription;

    public Parameter() {
    }

    public Parameter(String paramKey, String paramValue, String paramDescription) {
        this.paramKey = paramKey;
        this.paramValue = paramValue;
        this.paramDescription = paramDescription;
    }

    public String getParamKey() {
        return paramKey;
    }

    public void setParamKey(String paramKey) {
        this.paramKey = paramKey;
    }

    public String getParamValue() {
        return paramValue;
    }

    public void setParamValue(String paramValue) {
        this.paramValue = paramValue;
    }

    public String getParamDescription() {
        return paramDescription;
    }

    public void setParamDescription(String paramDescription) {
        this.paramDescription = paramDescription;
    }
}