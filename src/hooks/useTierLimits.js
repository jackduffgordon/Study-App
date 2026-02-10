import { useAuth } from './useAuth';
import { TIER_LIMITS } from '../constants/tierLimits';

export function useTierLimits() {
  const { user } = useAuth();

  if (!user) {
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

  const profile = user.user_metadata?.profile || {};
  const tier = profile.subscription_tier || 'free';
  const tierLimits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  const monthlyUploadsUsed = profile.monthly_uploads_used || 0;
  const monthlyGenerationsUsed = profile.monthly_generations_used || 0;
  const storageUsedBytes = profile.storage_used_bytes || 0;

  const uploadsRemaining = Math.max(
    0,
    tierLimits.monthly_uploads - monthlyUploadsUsed
  );
  const generationsRemaining = Math.max(
    0,
    tierLimits.monthly_generations - monthlyGenerationsUsed
  );
  const storageRemaining = Math.max(
    0,
    tierLimits.storage_bytes - storageUsedBytes
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
