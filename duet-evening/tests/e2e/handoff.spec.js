
import {test,expect} from '@playwright/test';
test('private key is absent from handoff and guessing screens',async({page})=>{
 await page.goto('/');await page.locator('#agree').check();await page.getByRole('button',{name:'Start game',exact:true}).click();
 await expect(page.locator('.board')).toHaveCount(0);
 await page.locator('#open-key').click();await expect(page.locator('.tile')).toHaveCount(25);
 await page.locator('#clue-number').selectOption('3');await page.locator('#submit').click();
 await expect(page.locator('.board')).toHaveCount(0);await page.locator('#open-guess').click();
 await expect(page.locator('.tile')).toHaveCount(25);await expect(page.locator('.tile.agent,.tile.assassin,.tile.bystander')).toHaveCount(0);
 await page.locator('#pause').click();await expect(page.locator('.board')).toHaveCount(0);
 await page.reload();await expect(page.getByRole('heading',{name:'Game paused'})).toBeVisible();
});
