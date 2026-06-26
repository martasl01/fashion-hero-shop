const STATE_KEY_PREFIX = "reko-actions-";

// Jedyne źródło klucza localStorage dla checkboxów akcji. Widgety (licznik na dashboardzie)
// i strony akcji (checklista) MUSZĄ używać tej samej funkcji, inaczej licznik rozjedzie się
// z checklistą bez żadnego błędu. Zwykły moduł (bez „use client"), bo wołają go też
// serwerowe strony akcji w czasie prerenderu — nie może być referencją kliencką.
export function stateKeyForSku(sku: string): string {
  return `${STATE_KEY_PREFIX}${sku}`;
}
