package br.com.virtualmimic.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class VirtualMimicApplication {

	public static void main(String[] args) {
		SpringApplication.run(VirtualMimicApplication.class, args);
	}

}
