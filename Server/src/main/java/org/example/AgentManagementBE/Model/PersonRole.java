package org.example.AgentManagementBE.Model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * Entity class for Person-Role many-to-many relationship
 */
@Entity
@Table(name = "Person_Role")
@IdClass(PersonRoleId.class)
public class PersonRole implements Serializable {
    
    @Id
    @Column(name = "person_id")
    private Integer personId;
    
    @Id
    @Column(name = "role_id")
    private Integer roleId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", insertable = false, updatable = false)
    private Person person;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;
    
    public PersonRole() {
    }
    
    public PersonRole(PersonRoleId id, Person person, Role role) {
        this.personId = id.getPersonId();
        this.roleId = id.getRoleId();
        this.person = person;
        this.role = role;
    }
    
    public PersonRole(Integer personId, Integer roleId) {
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
    
    public Person getPerson() {
        return person;
    }
    
    public void setPerson(Person person) {
        this.person = person;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        PersonRole that = (PersonRole) obj;
        return Objects.equals(personId, that.personId) &&
               Objects.equals(roleId, that.roleId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(personId, roleId);
    }
    
    @Override
    public String toString() {
        return "PersonRole{" +
                "personId=" + personId +
                ", roleId=" + roleId +
                '}';
    }
}
