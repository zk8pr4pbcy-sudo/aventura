import assert from "node:assert/strict";
import { chromium } from "playwright";

const base=process.env.AVENTURA_TEST_BASE_URL || "http://127.0.0.1:4173";
const browser=await chromium.launch({headless:true});
try {
  const langs=[
    {lang:"ar",query:"",half:"نصف يوم (حتى 4 ساعات)",full:"يوم كامل (حتى 8 ساعات)"},
    {lang:"en",query:"?lang=en",half:"Half day (up to 4 hours)",full:"Full day (up to 8 hours)"},
    {lang:"es",query:"?lang=es",half:"Medio día (hasta 4 horas)",full:"Día completo (hasta 8 horas)"}
  ];
  for(const item of langs){
    const joiner=item.query?"&":"?";
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(base+"/contact.html"+item.query+joiner+"type=service&request=thobe",{waitUntil:"load"});
    await page.waitForTimeout(250);
    assert.equal(await page.locator('[name="type"]').inputValue(),"guest-services",item.lang+" maps service request to guest services");
    assert.equal(await page.locator('#dynamicRequestPanel [name="guestService"]').inputValue(),"tailor",item.lang+" preselects thobe tailoring");
    assert.equal(await page.locator('[data-request-details="thobe"]').evaluate(el=>el.hidden),false,item.lang+" thobe detail group enabled");
    assert.equal(await page.locator('[data-request-details="flower"]').evaluate(el=>el.hidden),true,item.lang+" flower hidden initially");
    assert.equal(await page.locator('[name="duration"] option[value="half-day"]').textContent(),item.half);
    assert.equal(await page.locator('[name="duration"] option[value="full-day"]').textContent(),item.full);
    await page.locator('#dynamicRequestPanel [name="guestService"]').selectOption("flowers");
    assert.equal(await page.locator('[data-request-details="flower"]').evaluate(el=>el.hidden),false,item.lang+" flower detail group enabled");
    assert.equal(await page.locator('[data-request-details="thobe"]').evaluate(el=>el.hidden),true,item.lang+" thobe hidden after selection");
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),item.lang+" contact has no horizontal overflow");
    await page.close();

    const eventPage=await browser.newPage({viewport:{width:390,height:844}});
    await eventPage.goto(base+"/contact.html"+item.query+joiner+"type=event&request=private-event",{waitUntil:"load"});
    await eventPage.waitForTimeout(250);
    assert.equal(await eventPage.locator('[name="type"]').inputValue(),"private-event",item.lang+" maps event request to private event");
    assert.equal(await eventPage.locator('#dynamicRequestPanel [name="eventLocation"]').count(),1,item.lang+" event location field exists");
    assert.equal(await eventPage.locator('#dynamicRequestPanel [name="eventLevel"]').count(),3,item.lang+" event level choices exist");
    assert.equal(await eventPage.locator('#dynamicRequestPanel [name="addons[]"][value="venue"]').count(),1,item.lang+" venue service option exists");
    assert.equal(await eventPage.locator('#dynamicRequestPanel [name="addons[]"][value="reception"]').count(),1,item.lang+" guest reception option exists");
    assert.equal(await eventPage.locator('input[name*="budget"], select[name*="budget"]').count(),0,item.lang+" no budget field");
    assert.ok(await eventPage.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),item.lang+" event form fits mobile");
    await eventPage.close();
  }

  const corp=await browser.newPage();
  await corp.goto(base+"/corporate.html",{waitUntil:"load"});
  assert.equal(await corp.locator('[data-i18n="corporate.guestBoutique"]').getAttribute("href"),"guest-services.html#personal-services");
  await corp.close();

  const boutique=await browser.newPage();
  await boutique.goto(base+"/collection.html",{waitUntil:"load"});
  const bodyText=await boutique.locator("body").innerText();
  assert.ok(!/Original campaign artwork pending|Marketing card in preparation|التصميم الأصلي للبطاقة قيد الإعداد/i.test(bodyText));
  await boutique.close();

  for(const path of ["/privacy.html","/terms.html"]){
    const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await page.goto(base+path,{waitUntil:"load"});
    const fallback=page.locator(".legal-static-fallback");
    assert.equal(await fallback.count(),1,path+" static legal fallback exists");
    assert.ok((await fallback.innerText()).length>1000,path+" full fallback has substantial content");
    assert.equal(await fallback.evaluate(el=>getComputedStyle(el.closest("[data-legal-document]")).opacity),"1",path+" legal fallback is visible without JS");
    await page.close();
  }
  console.log("Audit regression browser checks passed.");
} finally {
  await browser.close();
}
