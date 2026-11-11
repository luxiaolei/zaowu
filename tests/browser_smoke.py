"""Optional browser checks. Install playwright separately; not needed by the app."""
import json, os, mimetypes
from urllib.parse import urlparse, unquote
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

HERMETIC=os.getenv('ZAOWU_HERMETIC')=='1'
BASE='https://zaowu.test' if HERMETIC else os.getenv('ZAOWU_TEST_URL','http://127.0.0.1:4173')
OUT=Path(os.getenv('ZAOWU_TEST_OUTPUT','/tmp/zaowu-browser'))
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1365,'height':1000},accept_downloads=True)
    if HERMETIC:
        # Local in-memory origin: no network access or browser policy modification.
        root=(Path(__file__).resolve().parents[1]/'site').resolve()
        def local_asset(route):
            parsed=urlparse(route.request.url)
            f=(root/unquote(parsed.path).lstrip('/')).resolve()
            if parsed.hostname!='zaowu.test' or not f.is_relative_to(root):
                return route.abort()
            if f.is_dir(): f=f/'index.html'
            if not f.exists(): return route.fulfill(status=404,body='Not found')
            mime=mimetypes.guess_type(f.name)[0] or 'application/octet-stream'
            route.fulfill(status=200,body=f.read_bytes(),content_type=mime)
        context.route('**/*',local_asset)
    page=context.new_page()
    errors=[]
    unexpected=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:unexpected.append(r.url) if not r.url.startswith(BASE) and not r.url.startswith('blob:') else None)
    page.goto(BASE)
    page.get_by_role('heading',name='一起开启创作岛').wait_for()
    page.screenshot(path=str(OUT/'onboarding.png'),full_page=True)
    page.locator('input[name=consent]').check()
    page.get_by_role('button',name='认识小芽，开始创造').click()
    page.locator('[data-start="sky"]').first.wait_for()
    page.screenshot(path=str(OUT/'home-desktop.png'),full_page=True)
    for kind in ['sky','garden','story']:
        page.locator(f'[data-start="{kind}"]').first.click()
        assert page.locator('[data-next]').is_disabled()
        page.locator('[data-choice="house"]').click()
        page.locator('[data-next]').click()
        page.locator('[data-palette="cool"]').click()
        page.locator('[data-next]').click()
        for stage in [2,3]:
            task=page.evaluate("""async () => {const {taskFor}=await import('./src/projects.js');const s=JSON.parse(localStorage.getItem('zaowu:trial:v1'));const p=s.projects.at(-1);return taskFor(p,p.stage===3)}""")
            # Exercise wrong -> hint -> correct on the first sky task.
            if kind=='sky' and stage==2:
                wrong=next(o['label'] for o in task['options'] if o['value']!=task['answer'])
                page.get_by_role('button',name=wrong,exact=True).click()
                page.locator('[data-hint]').click()
                assert page.locator('.hint-box').is_visible()
            answer=next(o['label'] for o in task['options'] if o['value']==task['answer'])
            page.get_by_role('button',name=answer,exact=True).click()
            assert page.locator('[data-next]').is_enabled()
            if kind=='sky' and stage==2:page.screenshot(path=str(OUT/'project-desktop.png'),full_page=True)
            page.locator('[data-next]').click()
        page.locator('[data-reflect="0"]').click()
        page.locator('[data-next]').click()
        page.locator('[data-complete]').click()
        page.locator('.gallery-card').first.wait_for()
        page.locator('nav a[href="#home"]').click()
    s=page.evaluate("JSON.parse(localStorage.getItem('zaowu:trial:v1'))")
    assert len([p for p in s['projects'] if p['completed']])==3
    sky_events=[e for e in s['evidence'] if e['skillId']=='comparison' and e['taskId']=='main']
    assert [e['outcome'] for e in sky_events]==['retry','supported']
    page.reload()
    page.locator('[data-start]').first.wait_for()
    assert '上次你完成了' in page.locator('main').inner_text()
    page.locator('nav a[href="#art"]').click()
    page.select_option('#art-theme','ocean')
    page.select_option('#art-subject','flower')
    page.select_option('#art-palette','forest')
    page.get_by_role('button',name='保存我的插画').click()
    with page.expect_download() as dl:page.locator('[data-export-art]').click()
    assert dl.value.suggested_filename.endswith('.svg')
    page.screenshot(path=str(OUT/'art-desktop.png'),full_page=True)
    page.locator('nav a[href="#parent"]').click()
    page.locator('input[name=guardian]').check()
    page.get_by_role('button',name='进入家长空间').click()
    page.locator('[data-retract]').first.wait_for()
    page.screenshot(path=str(OUT/'parent-desktop.png'),full_page=True)
    before=page.locator('[data-retract]').count()
    page.locator('[data-retract]').first.click()
    assert page.locator('[data-retract]').count()==before-1
    page.set_viewport_size({'width':390,'height':844})
    page.locator('nav a[href="#home"]').click()
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    page.screenshot(path=str(OUT/'home-mobile.png'),full_page=True)
    page.locator('[data-start="sky"]').first.click()
    page.locator('[data-choice="friend"]').click()
    page.locator('[data-next]').click()
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth')
    page.screenshot(path=str(OUT/'project-mobile.png'),full_page=True)
    page.reload() # Persisted draft, route safely returns home if no in-memory current ID.
    page.locator('[data-resume]').wait_for()
    page.locator('[data-resume]').click()
    expect(page.locator('h2')).to_have_text('给它一点你的颜色')
    page.locator('nav a[href="#parent"]').click()
    page.wait_for_function("!!document.querySelector('input[name=guardian], [data-delete]')")
    if page.locator('input[name=guardian]').count():
        page.locator('input[name=guardian]').check()
        page.get_by_role('button',name='进入家长空间').click()
    page.on('dialog',lambda d:d.accept())
    page.locator('[data-delete]').click()
    page.get_by_role('heading',name='一起开启创作岛').wait_for()
    assert page.evaluate("localStorage.getItem('zaowu:trial:v1')") is None
    assert not errors,errors
    assert not unexpected,unexpected
    report={'status':'passed','browser':'Chromium','hermetic':HERMETIC,'desktop':[1365,1000],'mobile_viewport':[390,844],
        'projects_completed':3,'flows':['onboarding','creative decisions','wrong/hint/retry','transfer','reflection','save','history','art/export','parent/retract','resume','delete'],
        'page_errors':errors,'unexpected_network_requests':unexpected,
        'limits':['No real iOS/Android device test','No LLM/provider test','No educational efficacy claim']}
    (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False))
    browser.close()
