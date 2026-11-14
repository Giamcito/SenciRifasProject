package com.rifas.BackRifas;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.rifas.BackRifas.model.Rifa;

@SpringBootTest
class BackRifasApplicationTests {

	@Test
	void contextLoads() {
	}

    @Test
    void testCalculoCifrasFormula() {
        assertEquals(3, Rifa.calcularCifras(1000), "1000 boletos deben ser 3 cifras (000 a 999)");
        assertEquals(4, Rifa.calcularCifras(10000), "10000 boletos deben ser 4 cifras (0000 a 9999)");
        assertEquals(5, Rifa.calcularCifras(100000), "100000 boletos deben ser 5 cifras (00000 a 99999)");
        assertEquals(3, Rifa.calcularCifras(500), "500 boletos deben ser 3 cifras (000 a 499)");
        assertEquals(2, Rifa.calcularCifras(50), "50 boletos deben ser 2 cifras (00 a 49)");
        assertEquals(4, Rifa.calcularCifras(5000), "5000 boletos deben ser 4 cifras (0000 a 4999)");
        assertEquals(2, Rifa.calcularCifras(100), "100 boletos deben ser 2 cifras (00 a 99)");
        assertEquals(1, Rifa.calcularCifras(10), "10 boletos deben ser 1 cifra (0 a 9)");
    }

}
