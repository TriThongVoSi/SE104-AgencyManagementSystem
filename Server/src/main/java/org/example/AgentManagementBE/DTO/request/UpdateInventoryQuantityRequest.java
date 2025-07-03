package org.example.AgentManagementBE.DTO.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateInventoryQuantityRequest {
    @NotNull(message = "Inventory quantity is required")
    @Min(value = 0, message = "Số lượng tồn kho không được nhỏ hơn 0")
    private Integer inventoryQuantity;

    public UpdateInventoryQuantityRequest() {
    }

    public UpdateInventoryQuantityRequest(Integer inventoryQuantity) {
        this.inventoryQuantity = inventoryQuantity;
    }

    public Integer getInventoryQuantity() {
        return inventoryQuantity;
    }

    public void setInventoryQuantity(Integer inventoryQuantity) {
        this.inventoryQuantity = inventoryQuantity;
    }
} 