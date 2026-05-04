import {
  buildInspectionDraftSummary,
  initialInspectionChecklist,
  isInspectionChecklistComplete,
  normaliseEngineerInitials,
} from '../src/utils/inspectionForm';

describe('inspection form helpers', () => {
  it('normalises engineer initials to trimmed uppercase text', () => {
    expect(normaliseEngineerInitials(' jc ')).toBe('JC');
  });

  it('returns a placeholder when initials are empty', () => {
    expect(normaliseEngineerInitials('   ')).toBe('Not set');
  });

  it('treats the checklist as incomplete until every item is true', () => {
    expect(isInspectionChecklistComplete(initialInspectionChecklist)).toBe(false);
    expect(
      isInspectionChecklistComplete({
        safeIsolation: true,
        structuralIntegrity: true,
        leakCheck: true,
      }),
    ).toBe(true);
  });

  it('builds a draft summary with trimmed notes length and checklist state', () => {
    expect(
      buildInspectionDraftSummary({
        engineerInitials: 'ab',
        condition: 'monitor',
        notes: '  follow up required  ',
        checklist: {
          safeIsolation: true,
          structuralIntegrity: true,
          leakCheck: false,
        },
      }),
    ).toEqual({
      engineerInitials: 'AB',
      condition: 'monitor',
      notesLength: 18,
      checklistComplete: false,
    });
  });
});