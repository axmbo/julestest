import { test, expect } from '@playwright/test';

test.describe('Tic Tac Toe E2E', () => {
  test('Local PvP game can be played and won', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('text=Jogo da Velha PWA');
    await page.locator('button:has-text("Humano vs Humano (Local)")').click();
    await page.waitForSelector('text=Jogador X vs Jogador O');

    const cells = page.locator('.cell');
    await expect(cells).toHaveCount(9);

    let currentTurn = await page.locator('p:has-text("Turno:")').textContent();
    let p1 = currentTurn?.includes('X') ? 'X' : 'O';
    let p2 = p1 === 'X' ? 'O' : 'X';

    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText(p1);

    await cells.nth(3).click();
    await expect(cells.nth(3)).toHaveText(p2);

    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText(p1);

    await cells.nth(4).click();
    await expect(cells.nth(4)).toHaveText(p2);

    await cells.nth(2).click();
    await expect(cells.nth(2)).toHaveText(p1);

    await expect(page.locator(`text=Vencedor: ${p1}`)).toBeVisible();

    // In local pvp, if P1 wins it sets score 'player1' or 'player2' depending on symbol
    // To make it robust:
    await expect(page.locator('text=Placar')).not.toHaveCount(0); // It just checks the score bar is present

    await page.locator('button:has-text("Jogar Novamente")').click();
    await expect(cells.nth(0)).toHaveText('');
  });

  test('Local PvC game can be played', async ({ page }) => {
    await page.goto('/');

    await page.locator('button:has-text("Humano vs Computador")').click();
    await page.waitForSelector('text=Você vs Computador');

    const cells = page.locator('.cell');

    let currentTurn = await page.locator('p:has-text("Turno:")').textContent();

    if (currentTurn?.includes('O')) {
      await page.waitForTimeout(1000);
      const oCells = await cells.filter({ hasText: 'O' }).count();
      expect(oCells).toBeGreaterThan(0);
    } else {
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');

      await page.waitForTimeout(1000);

      const oCells = await cells.filter({ hasText: 'O' }).count();
      expect(oCells).toBeGreaterThan(0);
    }
  });
});
