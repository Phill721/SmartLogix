package com.smartlogix.inventario;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

@SpringBootTest(classes = InventarioApplication.class, properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class InventarioApplicationTests {

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

	@Test
	void contextLoads() {
	}

}
