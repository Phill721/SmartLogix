package com.smartlogix.bff.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearPedidoRequestDTO {

    private Long carritoId;

    private List<CrearPedidoItemDTO> items;
}