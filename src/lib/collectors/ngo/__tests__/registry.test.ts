import { describe, it, expect, afterEach } from "vitest";
import { CollectorRegistry } from "../../CollectorRegistry";
import { RateLimiter } from "../../rateLimiter";
import { DevMemoryStore } from "../../store";
import { AmnestyCollector } from "../AmnestyCollector";
import { HRWCollector } from "../HRWCollector";
import { BtselemCollector } from "../BtselemCollector";
import { MSFCollector } from "../MSFCollector";
import { ICRCCollector } from "../ICRCCollector";

describe("NGO Collector Registry Integration", () => {
  let storage: DevMemoryStore;
  let rateLimiter: RateLimiter;
  let registry: CollectorRegistry;

  beforeEach(() => {
    storage = new DevMemoryStore();
    rateLimiter = new RateLimiter();
    registry = new CollectorRegistry(storage, rateLimiter);
  });

  afterEach(() => {
    registry.reset();
  });

  it("registers all NGO collectors for ngo source type", () => {
    registry.register(AmnestyCollector, ["ngo"], "Amnesty International collector");
    registry.register(HRWCollector, ["ngo"], "Human Rights Watch collector");
    registry.register(BtselemCollector, ["ngo"], "B'Tselem collector");
    registry.register(MSFCollector, ["ngo"], "MSF collector");

    expect(registry.hasCollectorForType("ngo")).toBe(true);
    expect(registry.hasCollectorForType("humanitarian")).toBe(false);

    const registrations = registry.listRegistrations();
    const ngoRegs = registrations.filter((r) => r.supportedSourceTypes.includes("ngo"));
    expect(ngoRegs).toHaveLength(4);
  });

  it("registers ICRCCollector for humanitarian source type, not ngo", () => {
    registry.register(ICRCCollector, ["humanitarian"], "ICRC humanitarian collector");

    expect(registry.hasCollectorForType("humanitarian")).toBe(true);
    expect(registry.hasCollectorForType("ngo")).toBe(false);

    const regs = registry.listRegistrations();
    const icrcReg = regs.find((r) => r.name === "ICRCCollector");
    expect(icrcReg).toBeDefined();
    expect(icrcReg?.supportedSourceTypes).toEqual(["humanitarian"]);
  });

  it("all NGO and humanitarian collectors coexist without conflict", () => {
    registry.register(AmnestyCollector, ["ngo"], "Amnesty");
    registry.register(HRWCollector, ["ngo"], "HRW");
    registry.register(BtselemCollector, ["ngo"], "B'Tselem");
    registry.register(MSFCollector, ["ngo"], "MSF");
    registry.register(ICRCCollector, ["humanitarian"], "ICRC");

    const all = registry.listRegistrations();
    expect(all).toHaveLength(5);
    expect(registry.hasCollectorForType("ngo")).toBe(true);
    expect(registry.hasCollectorForType("humanitarian")).toBe(true);
  });
});
