package org.example.AgentManagementBE.Service;

import org.example.AgentManagementBE.Config.SHA256PasswordEncoder;
import org.example.AgentManagementBE.exception.AppException;
import org.example.AgentManagementBE.exception.ErrorCode;
import org.example.AgentManagementBE.Model.Person;
import org.example.AgentManagementBE.DTO.request.ApiResponse;
import org.example.AgentManagementBE.Repository.PersonRepository;
import org.example.AgentManagementBE.Repository.PersonRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
@Transactional
public class PersonService {

    private final PersonRepository personRepository;
    private final PersonRoleRepository personRoleRepository;

    @Autowired
    public PersonService(PersonRepository personRepository, PersonRoleRepository personRoleRepository) {
        this.personRepository = personRepository;
        this.personRoleRepository = personRoleRepository;
    }

    public ResponseEntity<ApiResponse<Person>> login(String personEmail, String passwordHash) {
        if (personEmail == null || personEmail.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (passwordHash == null || passwordHash.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        Person person = personRepository.getUserByEmail(personEmail);
        if (person == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        
        // Use SHA-256 verification
        if (!SHA256PasswordEncoder.verifyPassword(passwordHash, person.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }
        
        if (!person.getIsActive()) {
            throw new AppException(ErrorCode.USER_INACTIVE);
        }
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", person));
    }

    public ResponseEntity<ApiResponse<Person>> createPerson(Person newPerson) {
        if (newPerson == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (newPerson.getPersonEmail() == null || newPerson.getPersonEmail().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (newPerson.getPasswordHash() == null || newPerson.getPasswordHash().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        if (newPerson.getPersonName() == null || newPerson.getPersonName().trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        if (existsByEmail(newPerson.getPersonEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        if (existsByUsername(newPerson.getPersonName())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }

        // Hash password with SHA-256 before saving
        String hashedPassword = SHA256PasswordEncoder.hashSHA256(newPerson.getPasswordHash());
        newPerson.setPasswordHash(hashedPassword);
        
        // Set default values
        newPerson.setIsActive(true);
        
        Person savedPerson = personRepository.save(newPerson);
        return ResponseEntity.ok(ApiResponse.success("Tạo người dùng thành công!", savedPerson));
    }

    public ResponseEntity<ApiResponse<Person>> getUserByEmail(String personEmail, String passwordHash) {
        return login(personEmail, passwordHash);
    }

    public ResponseEntity<ApiResponse<Person>> updatePerson(Integer personId, Person updatedPerson) {
        if (personId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Person existingPerson = personRepository.findById(personId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        if (updatedPerson.getPersonName() != null && !updatedPerson.getPersonName().equals(existingPerson.getPersonName())) {
            if (existsByUsername(updatedPerson.getPersonName())) {
                throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
            }
            existingPerson.setPersonName(updatedPerson.getPersonName());
        }
        
        if (updatedPerson.getPersonEmail() != null && !updatedPerson.getPersonEmail().equals(existingPerson.getPersonEmail())) {
            if (existsByEmail(updatedPerson.getPersonEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            existingPerson.setPersonEmail(updatedPerson.getPersonEmail());
        }
        
        if (updatedPerson.getFullName() != null) {
            existingPerson.setFullName(updatedPerson.getFullName());
        }
        
        if (updatedPerson.getPasswordHash() != null) {
            // Hash new password with SHA-256
            String hashedPassword = SHA256PasswordEncoder.hashSHA256(updatedPerson.getPasswordHash());
            existingPerson.setPasswordHash(hashedPassword);
        }
        
        Person savedPerson = personRepository.save(existingPerson);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công!", savedPerson));
    }

    public ResponseEntity<ApiResponse<Void>> deletePerson(Integer personId) {
        if (personId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Kiểm tra xem Person có liên kết với Agent không
        if (person.getAgent() != null) {
            // Có thể set agent = null hoặc throw exception
            // Ở đây tôi sẽ set agent = null để cho phép xóa
            person.setAgent(null);
            personRepository.save(person);
        }
        
        // Xóa tất cả PersonRole liên quan trước khi xóa Person
        personRoleRepository.deleteByPersonId(personId);
        
        // Xóa Person khỏi database (hard delete)
        personRepository.delete(person);
        
        return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công!", null));
    }

    public ResponseEntity<ApiResponse<List<Person>>> getAllPersons() {
        List<Person> persons = personRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công!", persons));
    }

    public ResponseEntity<ApiResponse<Person>> getPersonById(Integer personId) {
        if (personId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        
        Person person = personRepository.findById(personId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công!", person));
    }

    public Boolean existsByEmail(String personEmail) {
        if (personEmail == null || personEmail.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        return personRepository.existsByPersonEmail(personEmail);
    }

    public Boolean existsByUsername(String personName) {
        if (personName == null || personName.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        return personRepository.existsByPersonName(personName);
    }

    // Method for SecurityConfig
    public Person findByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return null;
        }
        return personRepository.findByPersonName(username).orElse(null);
    }

    // Method for SecurityConfig - find by email
    public Person findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return personRepository.findByPersonEmail(email).orElse(null);
    }

    // Method for SecurityConfig
    public List<String> getUserRoles(Integer personId) {
        if (personId == null) {
            return new ArrayList<>();
        }
        return personRoleRepository.findRoleNamesByPersonId(personId);
    }
}
