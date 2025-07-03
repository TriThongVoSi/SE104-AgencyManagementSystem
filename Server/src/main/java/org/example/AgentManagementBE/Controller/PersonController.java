package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Model.Person;
import org.example.AgentManagementBE.Service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/persons")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PersonController {

    private final PersonService personService;

    @Autowired
    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String personEmail, @RequestParam String passwordHash) {
        return personService.login(personEmail, passwordHash);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPerson(@RequestBody Person newPerson) {
        return personService.createPerson(newPerson);
    }

    @GetMapping("/email")
    public ResponseEntity<?> getUserByEmail(@RequestParam String personEmail, @RequestParam String passwordHash) {
        return personService.getUserByEmail(personEmail, passwordHash);
    }

    @PutMapping("/{personId}")
    @PreAuthorize("hasRole('ADMIN') or #personId == authentication.principal.personId")
    public ResponseEntity<?> updatePerson(@PathVariable Integer personId, @RequestBody Person updatedPerson) {
        return personService.updatePerson(personId, updatedPerson);
    }

    @DeleteMapping("/{personId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePerson(@PathVariable Integer personId) {
        return personService.deletePerson(personId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_ACCOUNTANT', 'DEBT_ACCOUNTANT')")
    public ResponseEntity<?> getAllPersons() {
        return personService.getAllPersons();
    }

    @GetMapping("/{personId}")
    @PreAuthorize("hasRole('ADMIN') or #personId == authentication.principal.personId")
    public ResponseEntity<?> getPersonById(@PathVariable Integer personId) {
        return personService.getPersonById(personId);
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> existsByEmail(@RequestParam String personEmail) {
        Boolean exists = personService.existsByEmail(personEmail);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/check-username")
    public ResponseEntity<?> existsByUsername(@RequestParam String personName) {
        Boolean exists = personService.existsByUsername(personName);
        return ResponseEntity.ok(exists);
    }
}
