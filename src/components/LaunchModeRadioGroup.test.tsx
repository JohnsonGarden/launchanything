import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LaunchModeRadioGroup } from "./LaunchModeRadioGroup";

const labels={environment:"环境变量",chromium:"Chromium 参数",combined:"组合模式"};
describe("launch method semantic radio choices",()=>{
  it("renders three mutually exclusive radios with visible gaps and a selection",()=>{
    const html=renderToStaticMarkup(<LaunchModeRadioGroup label="启动方式" value="chromium" onChange={()=>{}} labels={labels}/>);
    expect((html.match(/role="radio"/g)??[]).length).toBe(3);
    expect((html.match(/aria-checked="true"/g)??[]).length).toBe(1);
    expect(html).toContain("grid-cols-3 gap-3");
    expect(html).not.toContain("max-[410px]:grid-cols-1");
    expect(html).toContain("Chromium 参数");
    expect(html).toContain('value="chromium"');
  });
  it("supports all persisted launch modes",()=>{
    for(const mode of ["environment","chromium","combined"] as const){
      const html=renderToStaticMarkup(<LaunchModeRadioGroup label="Launch method" value={mode} onChange={()=>{}} labels={labels}/>);
      expect((html.match(/aria-checked="true"/g)??[]).length).toBe(1);
    }
  });
});
