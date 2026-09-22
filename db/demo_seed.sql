BEGIN;

INSERT INTO products
  (id,company_id,sku,name,presentation,barcode,control_unit,active,package_conversion)
VALUES
  ('p-colorau','company-a','COL100','Colorau','100 g','7891000000001','un',true,'[{"name":"caixa","multiplier":24}]'::jsonb),
  ('p-tempero','company-a','TEM300','Tempero Completo','300 g','7891000000002','un',true,'[]'::jsonb)
ON CONFLICT (company_id,id) DO UPDATE SET
  sku=excluded.sku,name=excluded.name,presentation=excluded.presentation,
  barcode=excluded.barcode,control_unit=excluded.control_unit,active=excluded.active,
  package_conversion=excluded.package_conversion;

INSERT INTO production_needs
  (id,company_id,product_id,target_quantity,confirmed_progress_quantity,
   registered_progress_quantity,priority,status,note)
VALUES
  ('need-colorau','company-a','p-colorau',4500,0,0,'URGENT','OPEN','Pedido especial')
ON CONFLICT (company_id,id) DO NOTHING;

INSERT INTO technical_sheets
  (id,company_id,product_id,version,active)
VALUES
  ('sheet-colorau-v1','company-a','p-colorau','1',true)
ON CONFLICT (company_id,id) DO UPDATE SET active=true, version='1';

INSERT INTO technical_sheet_items
  (company_id,technical_sheet_id,material_id,material_name,quantity_per_base,unit)
VALUES
  ('company-a','sheet-colorau-v1','m-colorau','Mistura Colorau',0.02,'kg')
ON CONFLICT (company_id,technical_sheet_id,material_id)
DO UPDATE SET material_name=excluded.material_name,
              quantity_per_base=excluded.quantity_per_base,
              unit=excluded.unit;

INSERT INTO stock_balances(company_id,item_id,item_kind,quantity)
VALUES
  ('company-a','p-colorau','FINISHED',0),
  ('company-a','m-colorau','MATERIAL',150)
ON CONFLICT (company_id,item_id,item_kind) DO NOTHING;

COMMIT;
