import { firstValueFrom } from 'rxjs';
import { MemberCertificationGoalMockAdapter } from './member-certification-goal-mock.adapter';

describe('MemberCertificationGoalMockAdapter', () => {
  it('givenSeededGoal_whenListMyCertificationGoals_thenReturnsDemoGoalForDemoMember', async () => {
    const adapter = new MemberCertificationGoalMockAdapter();
    const goals = await firstValueFrom(adapter.listMyCertificationGoals());
    expect(goals).toHaveLength(1);
    expect(goals[0].memberId).toBe('demo-member-1');
    expect(goals[0].recognizedCertificationId).toBe('rc-1');
    expect(goals[0].status).toBe('OBTAINED');
  });

  it('givenNewRecognizedCertification_whenUpsertMyCertificationGoal_thenAddsANewGoal', async () => {
    const adapter = new MemberCertificationGoalMockAdapter();
    const goal = await firstValueFrom(
      adapter.upsertMyCertificationGoal({ recognizedCertificationId: 'rc-2', status: 'PLANNED' }),
    );
    expect(goal.status).toBe('PLANNED');
    expect(goal.recognizedCertificationId).toBe('rc-2');
    const goals = await firstValueFrom(adapter.listMyCertificationGoals());
    expect(goals).toHaveLength(2);
  });

  it('givenExistingGoal_whenUpsertMyCertificationGoalWithNewStatus_thenUpdatesInPlaceRatherThanDuplicating', async () => {
    const adapter = new MemberCertificationGoalMockAdapter();
    await firstValueFrom(adapter.upsertMyCertificationGoal({ recognizedCertificationId: 'rc-1', status: 'PREPARING' }));
    const goals = await firstValueFrom(adapter.listMyCertificationGoals());
    expect(goals).toHaveLength(1);
    expect(goals[0].status).toBe('PREPARING');
  });
});
