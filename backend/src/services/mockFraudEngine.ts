import { prisma } from '../database/db';

export interface FraudAnalysisResult {
  riskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  velocityScore: number;
  triggerReason: string;
  geoRisk: string;
  deviceRisk: string;
  recommendedAction: 'ALLOW' | 'REVIEW' | 'HOLD' | 'BLOCK';
}

export class MockFraudEngine {
  /**
   * Performs deep heuristic & behavioral fraud evaluation
   */
  public async analyzeTransactionRisk(txId: string): Promise<FraudAnalysisResult> {
    const tx = await prisma.transactions.findUnique({
      where: { id: txId },
      include: { customer: true },
    });

    if (!tx) {
      return {
        riskScore: 50,
        riskLevel: 'MEDIUM',
        velocityScore: 30,
        triggerReason: 'Transaction record missing in engine',
        geoRisk: 'Unknown Location',
        deviceRisk: 'Unrecognized Device',
        recommendedAction: 'REVIEW',
      };
    }

    // Evaluate velocity based on transaction history of the customer
    const recentTxs = await prisma.transactions.count({
      where: { customerId: tx.customerId },
    });

    let riskScore = tx.riskScore || 10;
    let geoRisk = 'Domestic IP (US-East)';
    let deviceRisk = 'Known macOS Chrome';
    let triggerReason = 'Normal transaction velocity & matching device fingerprint';

    if (tx.amount > 2000) {
      riskScore += 25;
      triggerReason += ' | High monetary value transaction';
    }

    if (tx.customer.tier === 'HIGH_RISK') {
      riskScore += 35;
      triggerReason += ' | Account previously flagged for suspicious activity';
    }

    if (tx.location && (tx.location.includes('Nigeria') || tx.location.includes('Tor Exit') || tx.location.includes('High Risk Proxy'))) {
      riskScore += 40;
      geoRisk = `Suspicious Anonymizer Proxy (${tx.location})`;
      triggerReason += ' | Geolocation proxy mismatch detected';
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let recommendedAction: 'ALLOW' | 'REVIEW' | 'HOLD' | 'BLOCK' = 'ALLOW';

    if (riskScore >= 80) {
      riskLevel = 'CRITICAL';
      recommendedAction = 'BLOCK';
    } else if (riskScore >= 60) {
      riskLevel = 'HIGH';
      recommendedAction = 'HOLD';
    } else if (riskScore >= 35) {
      riskLevel = 'MEDIUM';
      recommendedAction = 'REVIEW';
    }

    return {
      riskScore,
      riskLevel,
      velocityScore: Math.min(100, recentTxs * 15),
      triggerReason,
      geoRisk,
      deviceRisk,
      recommendedAction,
    };
  }
}

export const mockFraudEngine = new MockFraudEngine();
