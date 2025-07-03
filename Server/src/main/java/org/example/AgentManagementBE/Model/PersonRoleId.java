package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * Composite key class for Person-Role many-to-many relationship
 */
@Embeddable
public class PersonRoleId implements Serializable {
    
    @Column(name = "person_id")
    private Integer personId;
    
    @Column(name = "role_id")
    private Integer roleId;
    
    public PersonRoleId() {
    }
    
    public PersonRoleId(Integer personId, Integer roleId) {
        this.personId = personId;
        this.roleId = roleId;
    }
    
    public Integer getPersonId() {
        return personId;
    }
    
    public void setPersonId(Integer personId) {
        this.personId = personId;
    }
    
    public Integer getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        PersonRoleId that = (PersonRoleId) obj;
        return Objects.equals(personId, that.personId) &&
               Objects.equals(roleId, that.roleId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(personId, roleId);
    }
    
    @Override
    public String toString() {
        return "PersonRoleId{" +
                "personId=" + personId +
                ", roleId=" + roleId +
                '}';
    }
} 