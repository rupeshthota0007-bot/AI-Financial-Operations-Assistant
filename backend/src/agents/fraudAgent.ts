import { AgentResult } from './types';
import { mockFraudEngine } from '../services/mockFraudEngine';

export class FraudAgent {
  public async evaluateRisk(transactionId: string): Promise<AgentResult> {
    const startTime = Date.now();
    const fraudResult = await mockFraudEngine.analyzeTransactionRisk(transactionId);

    const summary = `Fraud Risk Evaluation complete. Calculated Risk Score: ${fraudResult.riskScore}/100 (${fraudResult.riskLevel} RISK). Velocity score: ${fraudResult.velocityScore}. Recommended Action: ${fraudResult.recommendedAction}.`;

    return {
      agentName: 'Fraud Detection Agent',
      status: fraudResult.riskLevel === 'CRITICAL' || fraudResult.riskLevel === 'HIGH' ? 'WARNING' : 'SUCCESS',
      summary,
      confidence: 0.92,
      evidence: [
        { source: 'Fraud Rules Engine', content: `Trigger Reason: ${fraudResult.triggerReason}` },
        { source: 'GeoIP Analysis', content: fraudResult.geoRisk },
        { source: 'Device Fingerprinting', content: fraudResult.deviceRisk },
      ],
      data: {
        riskScore: fraudResult.riskScore,
        riskLevel: fraudResult.riskLevel,
        velocityScore: fraudResult.velocityScore,
        triggerReason: fraudResult.triggerReason,
        recommendedAction: fraudResult.recommendedAction,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }
}

export const fraudAgent = new FraudAgent();
