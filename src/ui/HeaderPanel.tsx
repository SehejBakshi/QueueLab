import { Transport } from "./controls/Transport";
import SystemParameters from "./controls/SystemParameters";
import RuleLens from "./RuleLens";

export default function HeaderPanel() {
  return (
    <section className="header-panel">
        <div className="title-block">
            <h1 className="title">QUEUE / LAB</h1>
            <p className="byline">A message queue, experienced as motion</p>
        </div>

        <div className="control-band">
            <div>
                <div className="section-label">SYSTEM CONFIGURATION</div>
                <SystemParameters />
            </div>

            <div>
                <div className="section-label">CONTROLS</div>
                <Transport />
            </div>
        </div>

        <div className="rule-log">
            <div className="section-label">RULE FIRING</div>
            <RuleLens />
        </div>
    </section>
  );
}
