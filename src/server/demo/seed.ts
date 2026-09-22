import type { RepositorySeed } from "../repositories/contracts";

export const demoSeed: RepositorySeed = {
  products: [
    {
      id: "p-colorau",
      companyId: "company-a",
      sku: "COL100",
      name: "Colorau",
      presentation: "100 g",
      barcode: "7891000000001",
      controlUnit: "un",
      active: true,
      packageConversion: [{ name: "caixa", multiplier: 24 }],
    },
    {
      id: "p-colorau-b",
      companyId: "company-b",
      sku: "COL100B",
      name: "Colorau B",
      presentation: "100 g",
      barcode: "7892000000001",
      controlUnit: "un",
      active: true,
    },
  ],
  needs: [
    {
      id: "need-colorau",
      companyId: "company-a",
      productId: "p-colorau",
      status: "OPEN",
      priority: "URGENT",
      targetQuantity: 4500,
      confirmedProgressQuantity: 0,
      registeredProgressQuantity: 0,
      note: "Pedido especial",
    },
  ],
  technicalSheets: [
    {
      id: "sheet-colorau-v1",
      companyId: "company-a",
      productId: "p-colorau",
      version: "1",
      items: [
        { materialId: "m-colorau", materialName: "Mistura Colorau", quantityPerBase: 0.02, unit: "kg" },
      ],
    },
  ],
  finishedStock: { "company-a:p-colorau": 0, "company-b:p-colorau-b": 0 },
  materialStock: { "company-a:m-colorau": 1.5 },
};
