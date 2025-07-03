package org.example.AgentManagementBE.Controller;

import org.example.AgentManagementBE.Service.PersonRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/person-roles")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")

public class PersonRoleController {

    private final PersonRoleService personRoleService;

    @Autowired
    public PersonRoleController(PersonRoleService personRoleService) {
        this.personRoleService = personRoleService;
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignRoleToPerson(@RequestParam Integer personId, @RequestParam Integer roleId) {
        return personRoleService.assignRoleToPerson(personId, roleId);
    }

    @DeleteMapping("/remove")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeRoleFromPerson(@RequestParam Integer personId, @RequestParam Integer roleId) {
        return personRoleService.removeRoleFromPerson(personId, roleId);
    }

    @GetMapping("/person/{personId}/roles")
    @PreAuthorize("hasRole('ADMIN') or #personId == authentication.principal.personId")
    public ResponseEntity<?> getRolesByPersonId(@PathVariable Integer personId) {
        return personRoleService.getRolesByPersonId(personId);
    }

    @GetMapping("/role/{roleId}/persons")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPersonsByRoleId(@PathVariable Integer roleId) {
        return personRoleService.getPersonsByRoleId(roleId);
    }

    @GetMapping("/person/{personId}/details")
    @PreAuthorize("hasRole('ADMIN') or #personId == authentication.principal.personId")
    public ResponseEntity<?> getPersonRolesByPersonId(@PathVariable Integer personId) {
        return personRoleService.getPersonRolesByPersonId(personId);
    }

    @GetMapping("/role/{roleId}/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPersonRolesByRoleId(@PathVariable Integer roleId) {
        return personRoleService.getPersonRolesByRoleId(roleId);
    }

    @DeleteMapping("/person/{personId}/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeAllRolesFromPerson(@PathVariable Integer personId) {
        return personRoleService.removeAllRolesFromPerson(personId);
    }

    @GetMapping("/check")
    @PreAuthorize("hasRole('ADMIN') or #personId == authentication.principal.personId")
    public ResponseEntity<?> hasRole(@RequestParam Integer personId, @RequestParam Integer roleId) {
        return personRoleService.hasRole(personId, roleId);
    }

    @GetMapping("/check-by-name")
    @PreAuthorize("hasRole('ADMIN') or #personId == authentication.principal.personId")
    public ResponseEntity<?> hasRoleByName(@RequestParam Integer personId, @RequestParam String roleName) {
        return personRoleService.hasRoleByName(personId, roleName);
    }
}
