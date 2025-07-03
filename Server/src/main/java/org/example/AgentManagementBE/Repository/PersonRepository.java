package org.example.AgentManagementBE.Repository;

import org.example.AgentManagementBE.Model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Integer> {
    // Find person by username
    Optional<Person> findByPersonName(String personName);
    
    // Find person by email
    Optional<Person> findByPersonEmail(String personEmail);
    
    // Find persons by name similarity using SOUNDEX (native query)
    @Query(value = "SELECT * FROM Person WHERE SOUNDEX(person_name) = SOUNDEX(:personName)", nativeQuery = true)
    List<Person> findByNameSimilarity(@Param("personName") String personName);
    
    // Check if person exists by username
    boolean existsByPersonName(String personName);
    
    // Check if person exists by email
    boolean existsByPersonEmail(String personEmail);

    // Get user by email
    @Query("SELECT p FROM Person p WHERE p.personEmail = :personEmail")
    Person getUserByEmail(@Param("personEmail") String personEmail);
    
    // Get user by username
    @Query("SELECT p FROM Person p WHERE p.personName = :personName")
    Person getUserByUsername(@Param("personName") String personName);
    
    // Find active users only
    @Query("SELECT p FROM Person p WHERE p.isActive = true")
    List<Person> findAllActive();
}
