import { useAuth } from '../contexts/AuthContext';
import { TIER_LIMITS } from '../lib/constants';

export function useTierLimits() {
  const { profile } = useAuth();

  if (!profile) {
    return {
      limits: TIER_LIMITS.free,
      canUpload: false,
      canGenerate: false,
      storageRemaining: 0,
      uploadsRemaining: 0,
      generationsRemaining: 0,
      tierName: 'Free',
      isFreeTier: true,
    };
  }

  const tier = profile.tier || 'free';
  const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  const monthlyUploadsUsed = profile.monthly_uploads_used || 0;
  const monthlyGenerationsUsed = profile.monthly_generations_used || 0;
  const storageUsedBytes = profile.storage_used_bytes || 0;

  const uploadsRemaining = Math.max(
    0,
    (tierLimits.uploads || 0) - monthlyUploadsUsed
  );
  const generationsRemaining = Math.max(
    0,
    (tierLimits.generations || 0) - monthlyGenerationsUsed
  );
  const storageRemaining = Math.max(
    0,
    (tierLimits.storage || 0) - storageUsedBytes
  );

  const canUpload =
    uploadsRemaining > 0 && storageRemaining > 0;
  const canGenerate =
    generationsRemaining > 0;

  const tierNameMap = {
    free: 'Free',
    pro: 'Pro',
    unlimited: 'Unlimited',
  };

  return {
    limits: tierLimits,
    canUpload,
    canGenerate,
    storageRemaining,
    uploadsRemaining,
    generationsRemaining,
    tierName: tierNameMap[tier] || 'Free',
    isFreeTier: tier === 'free',
    currentTier: tier,
    monthlyUploadsUsed,
    monthlyGenerationsUsed,
    storageUsedBytes,
  };
}
