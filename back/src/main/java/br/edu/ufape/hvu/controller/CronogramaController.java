package br.edu.ufape.hvu.controller;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.edu.ufape.hvu.controller.dto.request.CronogramaRequest;
import br.edu.ufape.hvu.controller.dto.response.CronogramaResponse;
import br.edu.ufape.hvu.exception.IdNotFoundException;
import br.edu.ufape.hvu.facade.Facade;
import br.edu.ufape.hvu.model.Cronograma;
import jakarta.validation.Valid;


@CrossOrigin (origins = "http://localhost:3000/" )
@RestController
@RequestMapping("/api/v1/")
public class CronogramaController {
	@Autowired
	private Facade facade;
	@Autowired
	private ModelMapper modelMapper;
	
	@GetMapping("cronograma")
	public List<CronogramaResponse> getAllCronograma() {
		return facade.getAllCronograma()
			.stream()
			.map(CronogramaResponse::new)
			.toList();
	}
	
	@PostMapping("cronograma")
	public CronogramaResponse createCronograma(@Valid @RequestBody CronogramaRequest newObj) {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			Jwt principal = (Jwt) authentication.getPrincipal();
			return new CronogramaResponse(facade.saveCronograma(newObj.convertToEntity(), principal.getSubject()));
		} catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
		}
	}
	
	@GetMapping("cronograma/{id}")
	public CronogramaResponse getCronogramaById(@PathVariable Long id) {
		try {
			return new CronogramaResponse(facade.findCronogramaById(id));
		} catch (IdNotFoundException ex) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, ex.getMessage());
		}
	}
	
	@PatchMapping("cronograma/{id}")
	public CronogramaResponse updateCronograma(@PathVariable Long id, @Valid @RequestBody CronogramaRequest obj) {
		try {
			//Cronograma o = obj.convertToEntity();
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			Jwt principal = (Jwt) authentication.getPrincipal();
			Cronograma oldObject = facade.findCronogramaById(id);

			TypeMap<CronogramaRequest, Cronograma> typeMapper = modelMapper
													.typeMap(CronogramaRequest.class, Cronograma.class)
													.addMappings(mapper -> mapper.skip(Cronograma::setId));			
			
			
			typeMapper.map(obj, oldObject);	
			return new CronogramaResponse(facade.updateCronograma(oldObject, principal.getSubject()));
		} catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage());
		}
		
	}
	
	@DeleteMapping("cronograma/{id}")
	public String deleteCronograma(@PathVariable Long id) {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			Jwt principal = (Jwt) authentication.getPrincipal();
			facade.deleteCronograma(id, principal.getSubject());
			return "";
		} catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
		}
		
	}
	

}
