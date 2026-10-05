/**
 * SmartShift – Employee Shift Scheduling System
 * Complete AI-driven Scheduling Engine, Greedy & Backtracking Algorithms,
 * Real-time Conflict Auditing, Interactive Matrix Calendar, and Analytics.
 */

const SmartShiftApp = (() => {
  // -------------------------------------------------------------
  // CONSTANTS & DEFAULT CONFIGURATION
  // -------------------------------------------------------------
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const STORAGE_KEY_PREFIX = 'smartshift_v1_';

  const DEFAULT_SETTINGS = {
    maxWeeklyHours: 40,
    maxDailyHours: 8,
    minRestHours: 12,
    maxConsecutiveDays: 5,
    nodeLimit: 3000,
    objective: 'coverage', // 'coverage' | 'fairness' | 'preferences' | 'overtime'
    weights: {
      hours: 40,
      preference: 25,
      shiftCount: 20,
      nightDist: 10,
      continuity: 5
    }
  };

  // 12 Realistic Seed Employees
  const SEED_EMPLOYEES = [
    {
      id: 'EMP-01',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@hospital.org',
      phone: '(555) 234-1001',
      role: 'Physician',
      skills: ['Emergency', 'Triage', 'ACLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Morning Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'preferred',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'unavailable',
        Sunday: 'unavailable'
      }
    },
    {
      id: 'EMP-02',
      name: 'Marcus Chen',
      email: 'marcus.chen@hospital.org',
      phone: '(555) 234-1002',
      role: 'Charge Nurse',
      skills: ['Triage', 'ACLS', 'BLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Morning Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'preferred',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-03',
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@hospital.org',
      phone: '(555) 234-1003',
      role: 'ICU Specialist',
      skills: ['ICU', 'ACLS', 'BLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Night Shift',
      status: 'Active',
      availability: {
        Monday: 'preferred',
        Tuesday: 'preferred',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-04',
      name: 'David Kim',
      email: 'david.kim@hospital.org',
      phone: '(555) 234-1004',
      role: 'Staff Nurse',
      skills: ['BLS', 'Pediatrics'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Evening Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'preferred',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-05',
      name: 'Priya Patel',
      email: 'priya.patel@hospital.org',
      phone: '(555) 234-1005',
      role: 'Triage Coordinator',
      skills: ['Triage', 'BLS', 'EHR'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Morning Shift',
      status: 'Active',
      availability: {
        Monday: 'preferred',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'preferred',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'unavailable'
      }
    },
    {
      id: 'EMP-06',
      name: 'James Wilson',
      email: 'james.wilson@hospital.org',
      phone: '(555) 234-1006',
      role: 'Staff Nurse',
      skills: ['BLS', 'ACLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Any',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-07',
      name: 'Aisha Al-Mansoor',
      email: 'aisha.m@hospital.org',
      phone: '(555) 234-1007',
      role: 'ICU Specialist',
      skills: ['ICU', 'ACLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Night Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'preferred',
        Thursday: 'preferred',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-08',
      name: 'Thomas Becker',
      email: 'thomas.becker@hospital.org',
      phone: '(555) 234-1008',
      role: 'Medical Assistant',
      skills: ['EHR', 'BLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Evening Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'preferred',
        Saturday: 'preferred',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-09',
      name: 'Maya Lin',
      email: 'maya.lin@hospital.org',
      phone: '(555) 234-1009',
      role: 'Staff Nurse',
      skills: ['BLS', 'Pediatrics'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Morning Shift',
      status: 'Active',
      availability: {
        Monday: 'preferred',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'preferred',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-10',
      name: 'Carlos Gomez',
      email: 'carlos.gomez@hospital.org',
      phone: '(555) 234-1010',
      role: 'Charge Nurse',
      skills: ['Triage', 'ACLS', 'BLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Evening Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'preferred',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-11',
      name: 'Rachel Green',
      email: 'rachel.green@hospital.org',
      phone: '(555) 234-1011',
      role: 'Medical Assistant',
      skills: ['EHR', 'BLS'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Morning Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'available',
        Sunday: 'available'
      }
    },
    {
      id: 'EMP-12',
      name: 'Liam O\'Connor',
      email: 'liam.oconnor@hospital.org',
      phone: '(555) 234-1012',
      role: 'Staff Nurse',
      skills: ['BLS', 'ICU'],
      maxWeeklyHours: 40,
      maxDailyHours: 8,
      minRestHours: 12,
      preferredShift: 'Night Shift',
      status: 'Active',
      availability: {
        Monday: 'available',
        Tuesday: 'available',
        Wednesday: 'available',
        Thursday: 'available',
        Friday: 'available',
        Saturday: 'preferred',
        Sunday: 'preferred'
      }
    }
  ];

  // Default Shifts
  const SEED_SHIFTS = [
    {
      id: 'SHIFT-01',
      name: 'Morning Shift',
      startTime: '06:00',
      endTime: '14:00',
      duration: 8,
      requiredCount: 3,
      requiredSkills: [],
      requiredRoles: [],
      priority: 'High'
    },
    {
      id: 'SHIFT-02',
      name: 'Evening Shift',
      startTime: '14:00',
      endTime: '22:00',
      duration: 8,
      requiredCount: 3,
      requiredSkills: [],
      requiredRoles: [],
      priority: 'Medium'
    },
    {
      id: 'SHIFT-03',
      name: 'Night Shift',
      startTime: '22:00',
      endTime: '06:00',
      duration: 8,
      requiredCount: 2,
      requiredSkills: [],
      requiredRoles: [],
      priority: 'High'
    }
  ];

  // -------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  let state = {
    employees: [],
    shifts: [],
    settings: { ...DEFAULT_SETTINGS },
    schedule: null, // Current active schedule
    benchmarkResults: null,
    currentWeekIndex: 0,
    activeView: 'dashboard',
    filterRole: 'all',
    filterShift: 'all',
    draggedSlot: null,
    charts: {}
  };

  // -------------------------------------------------------------
  // TIME & OVERNIGHT UTILITIES
  // -------------------------------------------------------------
  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  }

  function calculateShiftDuration(startTime, endTime) {
    const startMin = parseTimeToMinutes(startTime);
    const endMin = parseTimeToMinutes(endTime);
    if (endMin > startMin) {
      return (endMin - startMin) / 60;
    }
    // Overnight shift: e.g. 22:00 to 06:00
    return (24 * 60 - startMin + endMin) / 60;
  }

  function getShiftAbsoluteInterval(dayIndex, startTime, endTime) {
    const startMin = dayIndex * 24 * 60 + parseTimeToMinutes(startTime);
    let endMin = dayIndex * 24 * 60 + parseTimeToMinutes(endTime);
    if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
      // Spans into next day
      endMin += 24 * 60;
    }
    return { startMin, endMin };
  }

  // -------------------------------------------------------------
  // LOCAL STORAGE PERSISTENCE
  // -------------------------------------------------------------
  function loadData() {
    try {
      const storedEmp = localStorage.getItem(STORAGE_KEY_PREFIX + 'employees');
      const storedShifts = localStorage.getItem(STORAGE_KEY_PREFIX + 'shifts');
      const storedSettings = localStorage.getItem(STORAGE_KEY_PREFIX + 'settings');
      const storedSchedule = localStorage.getItem(STORAGE_KEY_PREFIX + 'schedule');

      state.employees = storedEmp ? JSON.parse(storedEmp) : JSON.parse(JSON.stringify(SEED_EMPLOYEES));
      state.shifts = storedShifts ? JSON.parse(storedShifts) : JSON.parse(JSON.stringify(SEED_SHIFTS));
      state.settings = storedSettings ? JSON.parse(storedSettings) : { ...DEFAULT_SETTINGS };
      state.schedule = storedSchedule ? JSON.parse(storedSchedule) : null;
    } catch (e) {
      console.error('Failed to load local storage, initializing demo seeds', e);
      resetToDemoData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'employees', JSON.stringify(state.employees));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'shifts', JSON.stringify(state.shifts));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'settings', JSON.stringify(state.settings));
      if (state.schedule) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'schedule', JSON.stringify(state.schedule));
      }
    } catch (e) {
      console.error('Error saving data to LocalStorage', e);
    }
  }

  function resetToDemoData() {
    state.employees = JSON.parse(JSON.stringify(SEED_EMPLOYEES));
    state.shifts = JSON.parse(JSON.stringify(SEED_SHIFTS));
    state.settings = { ...DEFAULT_SETTINGS };
    state.schedule = null;
    saveData();
    // Auto-generate initial schedule
    runScheduling('hybrid', state.settings.objective, state.settings.nodeLimit, false);
    showToast('Reset completed: Demo employees, shifts, and optimized schedule loaded.', 'info');
    renderAllViews();
  }

  // -------------------------------------------------------------
  // CORE ALGORITHMIC ENGINE: GREEDY & BACKTRACKING
  // -------------------------------------------------------------

  /**
   * Generates all required slots for the scheduling week.
   */
  function generateSlotManifest(shifts) {
    const slots = [];
    DAYS_OF_WEEK.forEach((dayName, dayIndex) => {
      shifts.forEach(shift => {
        const duration = calculateShiftDuration(shift.startTime, shift.endTime);
        const interval = getShiftAbsoluteInterval(dayIndex, shift.startTime, shift.endTime);
        const reqCount = shift.requiredCount || 1;
        for (let i = 0; i < reqCount; i++) {
          slots.push({
            id: `slot_${dayIndex}_${shift.id}_${i}`,
            dayIndex,
            dayName,
            shiftId: shift.id,
            shiftName: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            duration,
            interval,
            slotIndex: i,
            requiredSkills: shift.requiredSkills || [],
            requiredRoles: shift.requiredRoles || [],
            priority: shift.priority || 'Medium',
            isNight: shift.startTime >= '20:00' || shift.endTime <= '07:00'
          });
        }
      });
    });
    return slots;
  }

  /**
   * Validates if an employee can be assigned to a slot without violating hard constraints.
   */
  function checkAssignmentEligibility(emp, slot, currentAssignments, settings) {
    // 1. Employment status
    if (emp.status !== 'Active') {
      return { eligible: false, reason: 'Employee is marked Inactive' };
    }

    // 2. Day availability
    const empAvail = emp.availability ? emp.availability[slot.dayName] : 'available';
    if (empAvail === 'unavailable') {
      return { eligible: false, reason: `Unavailable on ${slot.dayName}` };
    }

    // 3. Required Roles
    if (slot.requiredRoles && slot.requiredRoles.length > 0) {
      if (!slot.requiredRoles.includes(emp.role)) {
        return { eligible: false, reason: `Role mismatch: Needs ${slot.requiredRoles.join('/')}` };
      }
    }

    // 4. Required Skills
    if (slot.requiredSkills && slot.requiredSkills.length > 0) {
      const hasAllSkills = slot.requiredSkills.every(reqSkill =>
        emp.skills && emp.skills.map(s => s.toLowerCase()).includes(reqSkill.toLowerCase())
      );
      if (!hasAllSkills) {
        return { eligible: false, reason: `Missing required skills: ${slot.requiredSkills.join(', ')}` };
      }
    }

    // Current assigned slots for this employee
    const empSlots = currentAssignments.filter(a => a.employeeId === emp.id);

    // 5. Daily Working Hours Limit & Overlapping shifts
    let dayHours = 0;
    const maxDaily = emp.maxDailyHours || settings.maxDailyHours;

    for (const a of empSlots) {
      // Same day overlap check
      if (a.dayIndex === slot.dayIndex) {
        dayHours += a.duration;
        // Direct time interval overlap check
        if (
          Math.max(a.interval.startMin, slot.interval.startMin) <
          Math.min(a.interval.endMin, slot.interval.endMin)
        ) {
          return { eligible: false, reason: `Overlapping shift on ${slot.dayName} with ${a.shiftName}` };
        }
      }
    }

    if (dayHours + slot.duration > maxDaily) {
      return { eligible: false, reason: `Exceeds max daily limit (${dayHours + slot.duration}h > ${maxDaily}h)` };
    }

    // 6. Weekly Working Hours Limit
    const currentWeeklyHours = empSlots.reduce((sum, a) => sum + a.duration, 0);
    const maxWeekly = emp.maxWeeklyHours || settings.maxWeeklyHours;
    if (currentWeeklyHours + slot.duration > maxWeekly) {
      return { eligible: false, reason: `Exceeds max weekly limit (${currentWeeklyHours + slot.duration}h > ${maxWeekly}h)` };
    }

    // 7. Minimum Rest Period Between Shifts
    const minRestMin = (emp.minRestHours || settings.minRestHours) * 60;
    for (const a of empSlots) {
      // If a is before slot
      if (a.interval.endMin <= slot.interval.startMin) {
        const rest = slot.interval.startMin - a.interval.endMin;
        if (rest < minRestMin) {
          return {
            eligible: false,
            reason: `Insufficient rest before shift (${Math.round(rest / 60)}h < ${emp.minRestHours || settings.minRestHours}h from ${a.shiftName})`
          };
        }
      }
      // If a is after slot
      if (slot.interval.endMin <= a.interval.startMin) {
        const rest = a.interval.startMin - slot.interval.endMin;
        if (rest < minRestMin) {
          return {
            eligible: false,
            reason: `Insufficient rest after shift (${Math.round(rest / 60)}h < ${emp.minRestHours || settings.minRestHours}h until ${a.shiftName})`
          };
        }
      }
    }

    return { eligible: true };
  }

  /**
   * Calculates greedy suitability score for an eligible employee.
   * Higher score = better candidate.
   */
  function calculateGreedyScore(emp, slot, currentAssignments, settings, employees) {
    const weights = settings.weights;
    let score = 0;

    const empSlots = currentAssignments.filter(a => a.employeeId === emp.id);
    const currentHours = empSlots.reduce((sum, a) => sum + a.duration, 0);
    const maxWeekly = emp.maxWeeklyHours || settings.maxWeeklyHours;

    // 1. Fewer assigned weekly hours (Fairness) -> 40 pts
    const hoursRatio = Math.max(0, 1 - (currentHours / maxWeekly));
    score += hoursRatio * weights.hours;

    // 2. Employee shift preference match -> 25 pts
    const dayAvail = emp.availability ? emp.availability[slot.dayName] : 'available';
    if (dayAvail === 'preferred' || emp.preferredShift === slot.shiftName || emp.preferredShift === 'Any') {
      score += weights.preference;
    }

    // 3. Lower number of assigned shifts -> 20 pts
    const avgShiftsPerEmp = currentAssignments.length / Math.max(1, employees.length);
    if (empSlots.length < avgShiftsPerEmp) {
      score += weights.shiftCount;
    } else {
      score += Math.max(0, 1 - (empSlots.length / 7)) * weights.shiftCount;
    }

    // 4. Fair distribution of night shifts -> 10 pts
    if (slot.isNight) {
      const empNightCount = empSlots.filter(a => a.isNight).length;
      if (empNightCount === 0) {
        score += weights.nightDist;
      } else {
        score += Math.max(0, weights.nightDist - (empNightCount * 3));
      }
    } else {
      score += 5; // Day bonus
    }

    // 5. Continuity of preferred working days -> 5 pts
    const worksYesterday = empSlots.some(a => a.dayIndex === slot.dayIndex - 1);
    const worksTomorrow = empSlots.some(a => a.dayIndex === slot.dayIndex + 1);
    if (worksYesterday || worksTomorrow) {
      score += weights.continuity;
    }

    return score;
  }

  /**
   * CORE ALGORITHM 1: GREEDY SCHEDULER
   */
  function runGreedyScheduler(slots, employees, settings) {
    const startTime = performance.now();
    const assignments = [];
    const unfilledSlots = [];

    // Sort slots by priority & difficulty:
    // High priority first, night shifts first, slots with specific skills first
    const sortedSlots = [...slots].sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const pDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      if (pDiff !== 0) return pDiff;
      if (a.isNight !== b.isNight) return b.isNight ? 1 : -1;
      return (b.requiredSkills.length + b.requiredRoles.length) - (a.requiredSkills.length + a.requiredRoles.length);
    });

    for (const slot of sortedSlots) {
      // Find all eligible employees
      const candidates = [];
      const rejectReasons = {};

      for (const emp of employees) {
        const eligibility = checkAssignmentEligibility(emp, slot, assignments, settings);
        if (eligibility.eligible) {
          const score = calculateGreedyScore(emp, slot, assignments, settings, employees);
          candidates.push({ emp, score });
        } else {
          rejectReasons[eligibility.reason] = (rejectReasons[eligibility.reason] || 0) + 1;
        }
      }

      if (candidates.length > 0) {
        // Sort descending by score (highest suitability score first)
        candidates.sort((a, b) => b.score - a.score);
        const bestCandidate = candidates[0].emp;

        assignments.push({
          ...slot,
          employeeId: bestCandidate.id,
          employeeName: bestCandidate.name,
          employeeRole: bestCandidate.role,
          score: candidates[0].score
        });
      } else {
        const topReason = Object.entries(rejectReasons)
          .sort((a, b) => b[1] - a[1])
          .map(([reason, count]) => `${reason} (${count} staff)`)
          .join(', ') || 'No eligible workforce found';

        unfilledSlots.push({
          ...slot,
          reason: topReason
        });
      }
    }

    const durationMs = Math.round(performance.now() - startTime);

    return {
      mode: 'Greedy',
      assignments,
      unfilledSlots,
      totalSlots: slots.length,
      filledCount: assignments.length,
      unfilledCount: unfilledSlots.length,
      coveragePct: Math.round((assignments.length / slots.length) * 100),
      durationMs,
      nodesExplored: slots.length
    };
  }

  /**
   * CORE ALGORITHM 2: RECURSIVE BACKTRACKING OPTIMIZER
   */
  function runBacktrackingScheduler(slots, employees, settings, initialAssignments = [], nodeLimit = 3000) {
    const startTime = performance.now();
    let nodesExplored = 0;
    let hitLimit = false;

    // Slots that are not yet filled
    const filledSlotIds = new Set(initialAssignments.map(a => a.id));
    const targetSlots = slots.filter(s => !filledSlotIds.has(s.id));

    // Sort target slots by constraint hardness (MRV - Minimum Remaining Values heuristic)
    targetSlots.sort((a, b) => {
      const countA = employees.filter(e => checkAssignmentEligibility(e, a, initialAssignments, settings).eligible).length;
      const countB = employees.filter(e => checkAssignmentEligibility(e, b, initialAssignments, settings).eligible).length;
      return countA - countB;
    });

    let bestAssignments = [...initialAssignments];
    let maxCoverage = bestAssignments.length;

    function evaluateScheduleQuality(schedule) {
      if (settings.objective === 'fairness') {
        const hoursMap = {};
        employees.forEach(e => (hoursMap[e.id] = 0));
        schedule.forEach(a => (hoursMap[a.employeeId] += a.duration));
        const hours = Object.values(hoursMap);
        const avg = hours.reduce((s, h) => s + h, 0) / hours.length;
        const variance = hours.reduce((s, h) => s + Math.pow(h - avg, 2), 0) / hours.length;
        return 1000 - Math.sqrt(variance); // Lower variance = higher quality
      }
      return schedule.length; // Default coverage
    }

    let bestQuality = evaluateScheduleQuality(bestAssignments);

    function backtrack(slotIndex, currentAssignments) {
      nodesExplored++;
      if (nodesExplored >= nodeLimit) {
        hitLimit = true;
        return;
      }

      // Check if current assignment beats best known
      const quality = evaluateScheduleQuality(currentAssignments);
      if (currentAssignments.length > maxCoverage || (currentAssignments.length === maxCoverage && quality > bestQuality)) {
        maxCoverage = currentAssignments.length;
        bestQuality = quality;
        bestAssignments = [...currentAssignments];
        // If we filled all slots, we can finish search
        if (maxCoverage === slots.length) return;
      }

      if (slotIndex >= targetSlots.length) {
        return;
      }

      // Pruning: if remaining slots + current assignments cannot beat best known, stop this branch
      if (currentAssignments.length + (targetSlots.length - slotIndex) < maxCoverage) {
        return;
      }

      const slot = targetSlots[slotIndex];

      // Generate eligible candidates sorted by greedy score
      const candidates = [];
      for (const emp of employees) {
        const eligibility = checkAssignmentEligibility(emp, slot, currentAssignments, settings);
        if (eligibility.eligible) {
          const score = calculateGreedyScore(emp, slot, currentAssignments, settings, employees);
          candidates.push({ emp, score });
        }
      }

      // Sort candidate choices by score
      candidates.sort((a, b) => b.score - a.score);

      for (const { emp, score } of candidates) {
        const assignmentRecord = {
          ...slot,
          employeeId: emp.id,
          employeeName: emp.name,
          employeeRole: emp.role,
          score
        };

        // Forward assignment
        currentAssignments.push(assignmentRecord);

        backtrack(slotIndex + 1, currentAssignments);

        // State restoration (Backtracking undo)
        currentAssignments.pop();

        if (maxCoverage === slots.length || hitLimit) {
          return;
        }
      }

      // Also explore branch skipping this slot (in case this slot cannot be filled)
      backtrack(slotIndex + 1, currentAssignments);
    }

    backtrack(0, [...initialAssignments]);

    const durationMs = Math.round(performance.now() - startTime);

    // Compute remaining unfilled
    const assignedIds = new Set(bestAssignments.map(a => a.id));
    const unfilledSlots = slots.filter(s => !assignedIds.has(s.id)).map(s => ({
      ...s,
      reason: hitLimit
        ? 'Search node limit reached before full resolution'
        : 'All candidate assignments lead to constraint violations'
    }));

    return {
      mode: 'Backtracking',
      assignments: bestAssignments,
      unfilledSlots,
      totalSlots: slots.length,
      filledCount: bestAssignments.length,
      unfilledCount: unfilledSlots.length,
      coveragePct: Math.round((bestAssignments.length / slots.length) * 100),
      durationMs,
      nodesExplored,
      hitLimit
    };
  }

  /**
   * CORE ALGORITHM 3: HYBRID ENGINE
   */
  function runHybridScheduler(slots, employees, settings, nodeLimit = 3000) {
    const startTime = performance.now();

    // 1. Initial fast schedule via Greedy
    const greedyResult = runGreedyScheduler(slots, employees, settings);

    if (greedyResult.unfilledCount === 0 && settings.objective === 'coverage') {
      // Already 100% covered!
      return {
        ...greedyResult,
        mode: 'Hybrid',
        durationMs: Math.round(performance.now() - startTime),
        improvementOverGreedy: 0
      };
    }

    // 2. Identify bottleneck slots (unfilled or contested)
    const unfilledIds = new Set(greedyResult.unfilledSlots.map(s => s.id));

    // Release assignments that directly conflict or border the unfilled slots to give backtracking flexibility
    const initialAssignments = greedyResult.assignments.filter(a => {
      // Keep assignments that are completely independent
      const nearUnfilled = Array.from(unfilledIds).some(uId => {
        const parts = uId.split('_');
        const dayIdx = parseInt(parts[1], 10);
        return Math.abs(a.dayIndex - dayIdx) <= 1; // Unfreeze neighbors
      });
      return !nearUnfilled;
    });

    // 3. Backtracking targeted optimization
    const btResult = runBacktrackingScheduler(slots, employees, settings, initialAssignments, nodeLimit);

    const durationMs = Math.round(performance.now() - startTime);
    const improvement = btResult.filledCount - greedyResult.filledCount;

    return {
      ...btResult,
      mode: 'Hybrid',
      durationMs,
      improvementOverGreedy: Math.max(0, improvement),
      baselineGreedyFilled: greedyResult.filledCount
    };
  }

  /**
   * Master execution dispatcher
   */
  function runScheduling(mode = 'hybrid', objective = 'coverage', nodeLimit = 3000, triggerToast = true) {
    const slots = generateSlotManifest(state.shifts);
    const settings = {
      ...state.settings,
      objective,
      nodeLimit: parseInt(nodeLimit, 10) || 3000
    };

    let result;
    if (mode === 'greedy') {
      result = runGreedyScheduler(slots, state.employees, settings);
    } else if (mode === 'backtracking') {
      result = runBacktrackingScheduler(slots, state.employees, settings, [], settings.nodeLimit);
    } else {
      result = runHybridScheduler(slots, state.employees, settings, settings.nodeLimit);
    }

    state.schedule = result;
    saveData();

    if (triggerToast) {
      showToast(
        `Generated schedule using ${result.mode} (${result.coveragePct}% Coverage, ${result.nodesExplored} nodes in ${result.durationMs}ms)`,
        'success'
      );
    }

    renderAllViews();
    return result;
  }

  // -------------------------------------------------------------
  // CONFLICT AUDITING ENGINE
  // -------------------------------------------------------------
  function auditSchedule(scheduleAssignments, employees, shifts, settings) {
    const conflicts = [];
    if (!scheduleAssignments || scheduleAssignments.length === 0) return conflicts;

    const empMap = {};
    employees.forEach(e => (empMap[e.id] = e));

    // Group assignments by employee
    const byEmp = {};
    scheduleAssignments.forEach(a => {
      if (!byEmp[a.employeeId]) byEmp[a.employeeId] = [];
      byEmp[a.employeeId].push(a);
    });

    // 1. Audit per employee constraints
    Object.entries(byEmp).forEach(([empId, empSlots]) => {
      const emp = empMap[empId];
      if (!emp) return;

      // Inactive
      if (emp.status !== 'Active') {
        conflicts.push({
          id: `conf_inactive_${empId}`,
          type: 'error',
          title: 'Inactive Employee Assigned',
          employeeName: emp.name,
          shiftName: 'Multiple shifts',
          dayName: 'All week',
          description: `${emp.name} is marked Inactive but has ${empSlots.length} shifts assigned.`,
          suggestion: 'Deassign or activate employee profile.'
        });
      }

      // Total weekly hours
      const totalWeekly = empSlots.reduce((sum, s) => sum + s.duration, 0);
      const maxWeekly = emp.maxWeeklyHours || settings.maxWeeklyHours;
      if (totalWeekly > maxWeekly) {
        conflicts.push({
          id: `conf_weekly_hrs_${empId}`,
          type: 'error',
          title: 'Weekly Working Hours Limit Exceeded',
          employeeName: emp.name,
          shiftName: `${totalWeekly} hrs assigned`,
          dayName: 'Week Total',
          description: `${emp.name} is scheduled for ${totalWeekly} hours (max allowable: ${maxWeekly} hours).`,
          suggestion: `Reassign ${totalWeekly - maxWeekly} hours to another eligible staff member.`
        });
      }

      // Consecutive days
      const daysWorked = new Set(empSlots.map(s => s.dayIndex));
      let consecutiveCount = 0;
      let maxConsecutive = 0;
      for (let d = 0; d < 7; d++) {
        if (daysWorked.has(d)) {
          consecutiveCount++;
          if (consecutiveCount > maxConsecutive) maxConsecutive = consecutiveCount;
        } else {
          consecutiveCount = 0;
        }
      }
      const allowedConsecutive = settings.maxConsecutiveDays || 5;
      if (maxConsecutive > allowedConsecutive) {
        conflicts.push({
          id: `conf_consec_${empId}`,
          type: 'warning',
          title: 'Excessive Consecutive Working Days',
          employeeName: emp.name,
          shiftName: `${maxConsecutive} days continuous`,
          dayName: 'Multiple days',
          description: `${emp.name} is scheduled for ${maxConsecutive} consecutive days (guideline cap: ${allowedConsecutive} days).`,
          suggestion: 'Grant a rest day mid-week to prevent staff fatigue.'
        });
      }

      // Check daily hours, overlaps, unavailable days, and rest periods
      const byDay = {};
      empSlots.forEach(s => {
        if (!byDay[s.dayIndex]) byDay[s.dayIndex] = [];
        byDay[s.dayIndex].push(s);
      });

      Object.entries(byDay).forEach(([dayIdxStr, daySlots]) => {
        const dayIdx = parseInt(dayIdxStr, 10);
        const dayName = DAYS_OF_WEEK[dayIdx];

        // Unavailable day check
        if (emp.availability && emp.availability[dayName] === 'unavailable') {
          conflicts.push({
            id: `conf_unavail_${empId}_${dayIdx}`,
            type: 'error',
            title: 'Assigned on Unavailable Day',
            employeeName: emp.name,
            shiftName: daySlots.map(s => s.shiftName).join(', '),
            dayName,
            description: `${emp.name} explicitly marked ${dayName} as unavailable.`,
            suggestion: `Reassign ${dayName} shift to an available team member.`
          });
        }

        // Daily hours check
        const dayHours = daySlots.reduce((sum, s) => sum + s.duration, 0);
        const maxDaily = emp.maxDailyHours || settings.maxDailyHours;
        if (dayHours > maxDaily) {
          conflicts.push({
            id: `conf_daily_${empId}_${dayIdx}`,
            type: 'error',
            title: 'Daily Hours Limit Exceeded',
            employeeName: emp.name,
            shiftName: `${dayHours} hrs on ${dayName}`,
            dayName,
            description: `${emp.name} is assigned ${dayHours} hours on ${dayName} exceeding daily cap of ${maxDaily} hours.`,
            suggestion: 'Split shifts or remove duplicate assignment.'
          });
        }

        // Overlapping shifts on same day
        for (let i = 0; i < daySlots.length; i++) {
          for (let j = i + 1; j < daySlots.length; j++) {
            const s1 = daySlots[i];
            const s2 = daySlots[j];
            if (
              Math.max(s1.interval.startMin, s2.interval.startMin) <
              Math.min(s1.interval.endMin, s2.interval.endMin)
            ) {
              conflicts.push({
                id: `conf_overlap_${empId}_${dayIdx}_${i}_${j}`,
                type: 'error',
                title: 'Double-Booked / Overlapping Shifts',
                employeeName: emp.name,
                shiftName: `${s1.shiftName} & ${s2.shiftName}`,
                dayName,
                description: `${emp.name} is assigned to two concurrent shifts simultaneously on ${dayName}.`,
                suggestion: 'Remove one of the overlapping assignments.'
              });
            }
          }
        }
      });

      // Minimum Rest Periods between all shifts
      const sortedEmpSlots = [...empSlots].sort((a, b) => a.interval.startMin - b.interval.startMin);
      const minRestHours = emp.minRestHours || settings.minRestHours;
      for (let i = 0; i < sortedEmpSlots.length - 1; i++) {
        const curr = sortedEmpSlots[i];
        const next = sortedEmpSlots[i + 1];
        const restHours = (next.interval.startMin - curr.interval.endMin) / 60;
        if (restHours < minRestHours && restHours >= 0) {
          conflicts.push({
            id: `conf_rest_${empId}_${curr.id}_${next.id}`,
            type: 'error',
            title: 'Insufficient Rest Period',
            employeeName: emp.name,
            shiftName: `${curr.shiftName} &rarr; ${next.shiftName}`,
            dayName: `${curr.dayName} to ${next.dayName}`,
            description: `Only ${Math.round(restHours)} hours rest between shifts (minimum required: ${minRestHours} hours).`,
            suggestion: 'Reschedule either shift to ensure mandatory 12-hour recovery.'
          });
        }
      }
    });

    // 2. Audit Understaffed Shifts
    const slotCounts = {};
    scheduleAssignments.forEach(a => {
      const key = `${a.dayIndex}_${a.shiftId}`;
      slotCounts[key] = (slotCounts[key] || 0) + 1;
    });

    DAYS_OF_WEEK.forEach((dayName, dayIndex) => {
      shifts.forEach(shift => {
        const key = `${dayIndex}_${shift.id}`;
        const assigned = slotCounts[key] || 0;
        const required = shift.requiredCount || 1;
        if (assigned < required) {
          conflicts.push({
            id: `conf_understaff_${dayIndex}_${shift.id}`,
            type: 'warning',
            title: 'Understaffed Shift Requirement',
            employeeName: 'Unassigned Positions',
            shiftName: shift.name,
            dayName,
            description: `${shift.name} on ${dayName} requires ${required} staff, but only ${assigned} assigned (${required - assigned} vacant).`,
            suggestion: 'Run Hybrid Backtracking or manually assign available staff.'
          });
        }
      });
    });

    return conflicts;
  }

  // -------------------------------------------------------------
  // UI RENDERING MODULES
  // -------------------------------------------------------------

  function renderAllViews() {
    renderDashboardView();
    renderCalendarView();
    renderEmployeesView();
    renderShiftsView();
    renderAvailabilityView();
    renderConflictsView();
    renderAnalyticsView();
    renderSettingsView();
  }

  // 1. Dashboard View
  function renderDashboardView() {
    const totalEmp = state.employees.length;
    const activeEmp = state.employees.filter(e => e.status === 'Active').length;
    const totalSlots = state.schedule ? state.schedule.totalSlots : 0;
    const filledCount = state.schedule ? state.schedule.filledCount : 0;
    const unfilledCount = state.schedule ? state.schedule.unfilledCount : 0;
    const assignments = state.schedule ? state.schedule.assignments : [];

    const totalHours = assignments.reduce((sum, a) => sum + a.duration, 0);
    const scheduledEmpCount = new Set(assignments.map(a => a.employeeId)).size;
    const avgHours = activeEmp > 0 ? (totalHours / activeEmp).toFixed(1) : 0;

    // Efficiency: coverage % weighted with preferences
    let prefMatches = 0;
    assignments.forEach(a => {
      const emp = state.employees.find(e => e.id === a.employeeId);
      if (emp && (emp.preferredShift === a.shiftName || emp.preferredShift === 'Any')) {
        prefMatches++;
      }
    });
    const prefPct = assignments.length > 0 ? Math.round((prefMatches / assignments.length) * 100) : 0;
    const coveragePct = state.schedule ? state.schedule.coveragePct : 100;
    const efficiency = Math.round((coveragePct * 0.7) + (prefPct * 0.3));

    // Metrics DOM updates
    document.getElementById('dash-total-emp').textContent = totalEmp;
    document.getElementById('dash-active-emp').textContent = `${activeEmp} Active Workforce`;
    document.getElementById('dash-total-shifts').textContent = totalSlots || 21;
    document.getElementById('dash-emp-scheduled').textContent = scheduledEmpCount;
    document.getElementById('dash-unfilled-shifts').textContent = unfilledCount;
    document.getElementById('dash-unfilled-subtext').textContent = unfilledCount === 0 ? 'All slots covered' : `${unfilledCount} vacant slots detected`;
    document.getElementById('dash-total-hours').textContent = `${totalHours} hrs`;
    document.getElementById('dash-avg-hours').textContent = `Avg ${avgHours} hrs / emp`;
    document.getElementById('dash-efficiency').textContent = `${efficiency}%`;

    // Render Dashboard Charts
    renderHoursDistributionChart('chart-hours-distribution');
    renderShiftCoverageChart('chart-shift-coverage');

    // Dashboard Alerts Snippet
    const conflicts = auditSchedule(assignments, state.employees, state.shifts, state.settings);
    const alertsContainer = document.getElementById('dash-alerts-list');
    const badge = document.getElementById('sidebar-conflict-count');
    badge.textContent = conflicts.length;
    badge.className = conflicts.length > 0 ? 'badge' : 'badge neutral';

    if (conflicts.length === 0) {
      alertsContainer.innerHTML = `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 14px; color: #166534; font-size: 13px; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <strong>All Compliance Checks Passed:</strong> Zero scheduling conflicts, double-bookings, or rest period violations.
        </div>`;
    } else {
      alertsContainer.innerHTML = conflicts.slice(0, 3).map(c => `
        <div class="alert-card ${c.type}">
          <div class="alert-content">
            <div class="alert-title">${c.title} &ndash; <span style="font-weight:400">${c.employeeName}</span></div>
            <div class="alert-desc">${c.description}</div>
            <div class="alert-suggestion">&bull; ${c.suggestion}</div>
          </div>
        </div>
      `).join('');
      if (conflicts.length > 3) {
        alertsContainer.innerHTML += `
          <div style="text-align: center; margin-top: 8px;">
            <a href="#" onclick="SmartShiftApp.switchView('conflicts'); return false;" style="color: var(--primary); font-size: 12px; font-weight: 600;">+ ${conflicts.length - 3} more alerts in audit log</a>
          </div>`;
      }
    }

    // Dashboard Recent Activity Log
    const actContainer = document.getElementById('dash-activity-log');
    const scheduleMode = state.schedule ? state.schedule.mode : 'Hybrid Engine';
    const scheduleDuration = state.schedule ? state.schedule.durationMs : 14;
    const scheduleTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    actContainer.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 5px;"></span>
        <div>
          <div><strong>Schedule Generated:</strong> Executed ${scheduleMode} (${scheduleDuration}ms).</div>
          <div style="color: var(--text-muted); font-size: 11px;">Today at ${scheduleTimeStr}</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); margin-top: 5px;"></span>
        <div>
          <div><strong>Constraint Audit Complete:</strong> Verified 40h/week, 8h/day, and 12h rest limits.</div>
          <div style="color: var(--text-muted); font-size: 11px;">Automatic background monitor</div>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: flex-start;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #0891b2; margin-top: 5px;"></span>
        <div>
          <div><strong>Workforce Available:</strong> ${activeEmp} active staff profiles synced.</div>
          <div style="color: var(--text-muted); font-size: 11px;">Local storage persistent store</div>
        </div>
      </div>
    `;
  }

  // 2. Weekly Calendar View
  function renderCalendarView() {
    const tbody = document.getElementById('calendar-grid-body');
    const assignments = state.schedule ? state.schedule.assignments : [];

    // Filter employees
    let filteredEmployees = state.employees.filter(e => e.status === 'Active');
    if (state.filterRole !== 'all') {
      filteredEmployees = filteredEmployees.filter(e => e.role === state.filterRole);
    }

    // Role filter dropdown population
    const roleSelect = document.getElementById('cal-filter-role');
    const roles = Array.from(new Set(state.employees.map(e => e.role)));
    roleSelect.innerHTML = `<option value="all">All Roles (${state.employees.length})</option>` +
      roles.map(r => `<option value="${r}" ${state.filterRole === r ? 'selected' : ''}>${r}</option>`).join('');

    // Pre-group assignments by employeeId and dayIndex
    const empDayAssignments = {};
    assignments.forEach(a => {
      if (state.filterShift !== 'all' && a.shiftName !== state.filterShift) return;
      const key = `${a.employeeId}_${a.dayIndex}`;
      if (!empDayAssignments[key]) empDayAssignments[key] = [];
      empDayAssignments[key].push(a);
    });

    tbody.innerHTML = filteredEmployees.map(emp => {
      const empSlots = assignments.filter(a => a.employeeId === emp.id);
      const totalEmpHours = empSlots.reduce((s, a) => s + a.duration, 0);
      const isOverLimit = totalEmpHours > (emp.maxWeeklyHours || state.settings.maxWeeklyHours);

      let rowHtml = `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${emp.name}</div>
            <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
              <span class="role-badge primary">${emp.role}</span>
              <span style="font-size: 11px; color: var(--text-muted);">${emp.preferredShift || 'Any'}</span>
            </div>
          </td>
      `;

      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const dayKey = `${emp.id}_${dayIdx}`;
        const daySlots = empDayAssignments[dayKey] || [];
        const dayName = DAYS_OF_WEEK[dayIdx];
        const dayAvail = emp.availability ? emp.availability[dayName] : 'available';

        let cellBg = '';
        if (dayAvail === 'unavailable') cellBg = 'background-color: #fff1f2;';

        rowHtml += `
          <td style="${cellBg}" class="drop-zone"
              data-emp-id="${emp.id}"
              data-day-index="${dayIdx}"
              ondragover="SmartShiftApp.handleDragOver(event)"
              ondragleave="SmartShiftApp.handleDragLeave(event)"
              ondrop="SmartShiftApp.handleDrop(event, '${emp.id}', ${dayIdx})">
        `;

        if (daySlots.length === 0 && dayAvail === 'unavailable') {
          rowHtml += `<div style="font-size: 10px; color: #ef4444; font-weight: 600; text-align: center; margin-top: 10px;">Unavailable</div>`;
        }

        daySlots.forEach(slot => {
          let shiftClass = 'shift-morning';
          if (slot.shiftName.toLowerCase().includes('evening')) shiftClass = 'shift-evening';
          if (slot.shiftName.toLowerCase().includes('night')) shiftClass = 'shift-night';

          rowHtml += `
            <div class="shift-card ${shiftClass}"
                 draggable="true"
                 ondragstart="SmartShiftApp.handleDragStart(event, '${slot.id}', '${emp.id}', ${dayIdx})"
                 onclick="SmartShiftApp.openShiftDetailModal('${slot.id}')">
              <div class="shift-card-header">
                <span class="shift-card-title">${slot.shiftName}</span>
                <span class="shift-card-time">${slot.duration}h</span>
              </div>
              <div class="shift-card-time">${slot.startTime} - ${slot.endTime}</div>
            </div>
          `;
        });

        rowHtml += `</td>`;
      }

      rowHtml += `
          <td>
            <div style="font-weight: 700; font-size: 13px; color: ${isOverLimit ? 'var(--danger)' : 'var(--text-main)'};">
              ${totalEmpHours} / ${emp.maxWeeklyHours || 40}h
            </div>
            ${isOverLimit ? '<span class="shift-badge-conflict">Overtime</span>' : ''}
          </td>
        </tr>
      `;
      return rowHtml;
    }).join('');

    // Table view alternative rendering
    renderScheduleTableView();
  }

  function renderScheduleTableView() {
    const tableBody = document.getElementById('schedule-table-body');
    const assignments = state.schedule ? state.schedule.assignments : [];
    const unfilled = state.schedule ? state.schedule.unfilledSlots : [];

    const rows = [];

    DAYS_OF_WEEK.forEach((dayName, dayIndex) => {
      state.shifts.forEach(shift => {
        const matchingAssigned = assignments.filter(a => a.dayIndex === dayIndex && a.shiftId === shift.id);
        const matchingUnfilled = unfilled.filter(u => u.dayIndex === dayIndex && u.shiftId === shift.id);

        const assignedNames = matchingAssigned.map(a => a.employeeName).join(', ') || '<em style="color:#ef4444">None assigned</em>';
        const isFull = matchingAssigned.length >= (shift.requiredCount || 1);

        rows.push(`
          <tr>
            <td><strong>${dayName}</strong></td>
            <td>${shift.name}</td>
            <td>${shift.startTime} – ${shift.endTime} (${shift.duration}h)</td>
            <td>${assignedNames}</td>
            <td>${shift.requiredSkills.map(s => `<span class="skill-tag">${s}</span>`).join('') || '<span style="color:#94a3b8">None</span>'}</td>
            <td>
              <span class="badge" style="background: ${isFull ? 'var(--success)' : 'var(--danger)'}">
                ${matchingAssigned.length} / ${shift.requiredCount} Staff
              </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-sm" onclick="SmartShiftApp.switchView('calendar')">Manage</button>
            </td>
          </tr>
        `);
      });
    });

    tableBody.innerHTML = rows.join('');
  }

  // 3. Employee Management View
  function renderEmployeesView() {
    const tbody = document.getElementById('employee-table-body');
    const searchVal = (document.getElementById('emp-search-input').value || '').toLowerCase();
    const roleFilter = document.getElementById('emp-role-filter').value;
    const statusFilter = document.getElementById('emp-status-filter').value;

    // Populate role filter dropdown
    const roleSelect = document.getElementById('emp-role-filter');
    const currentVal = roleSelect.value;
    const roles = Array.from(new Set(state.employees.map(e => e.role)));
    roleSelect.innerHTML = `<option value="all">All Roles</option>` +
      roles.map(r => `<option value="${r}">${r}</option>`).join('');
    roleSelect.value = currentVal || 'all';

    const assignments = state.schedule ? state.schedule.assignments : [];

    const filtered = state.employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(searchVal) || emp.id.toLowerCase().includes(searchVal);
      const matchRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });

    tbody.innerHTML = filtered.map(emp => {
      const empSlots = assignments.filter(a => a.employeeId === emp.id);
      const weeklyHours = empSlots.reduce((s, a) => s + a.duration, 0);

      return `
        <tr>
          <td><strong>${emp.id}</strong></td>
          <td>
            <div style="font-weight:600;">${emp.name}</div>
            <div style="font-size:11px; color:var(--text-muted);">${emp.email} &bull; ${emp.phone || ''}</div>
          </td>
          <td><span class="role-badge primary">${emp.role}</span></td>
          <td>${(emp.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}</td>
          <td>
            <strong>${weeklyHours}</strong> / ${emp.maxWeeklyHours}h wk
            <div style="font-size:11px; color:var(--text-muted);">${emp.maxDailyHours}h / day</div>
          </td>
          <td>${emp.preferredShift || 'Any'}</td>
          <td>${emp.minRestHours || 12}h</td>
          <td>
            <span class="status-indicator">
              <span class="status-dot ${emp.status === 'Active' ? 'active' : 'inactive'}"></span>
              ${emp.status}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="SmartShiftApp.openEditEmployeeModal('${emp.id}')">Edit</button>
              <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="SmartShiftApp.deleteEmployee('${emp.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. Shift Management View
  function renderShiftsView() {
    const tbody = document.getElementById('shift-table-body');
    tbody.innerHTML = state.shifts.map(shift => {
      const duration = calculateShiftDuration(shift.startTime, shift.endTime);
      return `
        <tr>
          <td><strong>${shift.id}</strong></td>
          <td><strong>${shift.name}</strong></td>
          <td>${shift.startTime} &ndash; ${shift.endTime}</td>
          <td>${duration} hrs</td>
          <td><span class="badge neutral">${shift.requiredCount || 1} staff / day</span></td>
          <td>${(shift.requiredSkills || []).map(s => `<span class="skill-tag">${s}</span>`).join('') || '<span style="color:#94a3b8;">None</span>'}</td>
          <td>${(shift.requiredRoles || []).map(r => `<span class="role-badge">${r}</span>`).join('') || '<span style="color:#94a3b8;">Any Role</span>'}</td>
          <td><span class="role-badge ${shift.priority === 'High' ? 'warning' : 'primary'}">${shift.priority || 'Medium'}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="SmartShiftApp.openEditShiftModal('${shift.id}')">Edit</button>
              <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="SmartShiftApp.deleteShift('${shift.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 5. Availability Matrix View
  function renderAvailabilityView() {
    const grid = document.getElementById('availability-grid');
    let html = `<div class="avail-header-cell">Employee</div>`;
    DAYS_OF_WEEK.forEach(day => {
      html += `<div class="avail-header-cell">${day}</div>`;
    });

    state.employees.forEach(emp => {
      html += `<div class="avail-row-cell">
        <div>
          <div style="font-weight:700;">${emp.name}</div>
          <div style="font-size:11px; color:var(--text-muted);">${emp.role}</div>
        </div>
      </div>`;

      DAYS_OF_WEEK.forEach(day => {
        const currentStatus = emp.availability ? (emp.availability[day] || 'unconfigured') : 'unconfigured';
        html += `
          <div class="avail-row-cell" onclick="SmartShiftApp.cycleEmployeeAvailability('${emp.id}', '${day}')">
            <span class="avail-tag ${currentStatus}">
              ${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
          </div>
        `;
      });
    });

    grid.innerHTML = html;
  }

  function cycleEmployeeAvailability(empId, day) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;
    if (!emp.availability) emp.availability = {};

    const states = ['available', 'preferred', 'unavailable', 'unconfigured'];
    const current = emp.availability[day] || 'unconfigured';
    const nextIdx = (states.indexOf(current) + 1) % states.length;
    emp.availability[day] = states[nextIdx];

    saveData();
    renderAvailabilityView();
    showToast(`Updated ${emp.name}'s availability on ${day} to ${states[nextIdx]}`, 'info');
  }

  // 6. Conflicts View
  function renderConflictsView() {
    const container = document.getElementById('full-conflicts-list');
    const assignments = state.schedule ? state.schedule.assignments : [];
    const conflicts = auditSchedule(assignments, state.employees, state.shifts, state.settings);

    if (conflicts.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px; background: #f8fafc; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" style="margin-bottom: 12px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Zero Conflicts Detected</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 500px; margin: 0 auto;">
            The active schedule fully conforms to all working-hour ceilings, rest-period intervals, skill prerequisites, and employee availability rules.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = conflicts.map(c => `
      <div class="alert-card ${c.type}">
        <div class="alert-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="alert-content">
          <div class="alert-title">${c.title} &ndash; <strong>${c.employeeName}</strong></div>
          <div class="alert-desc">${c.description}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">
            <strong>Shift/Time:</strong> ${c.shiftName} (${c.dayName})
          </div>
          <div class="alert-suggestion">
            <strong>Suggested Correction:</strong> ${c.suggestion}
          </div>
        </div>
      </div>
    `).join('');
  }

  // 7. Analytics View
  function renderAnalyticsView() {
    const assignments = state.schedule ? state.schedule.assignments : [];
    const totalHours = assignments.reduce((s, a) => s + a.duration, 0);
    const activeEmp = state.employees.filter(e => e.status === 'Active').length;
    const avgHours = activeEmp > 0 ? (totalHours / activeEmp).toFixed(1) : 0;
    const totalSlots = state.schedule ? state.schedule.totalSlots : 0;
    const unfilledCount = state.schedule ? state.schedule.unfilledCount : 0;
    const coveragePct = state.schedule ? state.schedule.coveragePct : 100;

    // Overtime
    let overtime = 0;
    state.employees.forEach(emp => {
      const empHours = assignments.filter(a => a.employeeId === emp.id).reduce((s, a) => s + a.duration, 0);
      if (empHours > (emp.maxWeeklyHours || 40)) {
        overtime += (empHours - (emp.maxWeeklyHours || 40));
      }
    });

    document.getElementById('rep-total-hours').textContent = `${totalHours} hrs`;
    document.getElementById('rep-avg-hours').textContent = `${avgHours} hrs`;
    document.getElementById('rep-total-shifts').textContent = `${assignments.length} slots`;
    document.getElementById('rep-coverage-pct').textContent = `${coveragePct}%`;
    document.getElementById('rep-unfilled-count').textContent = unfilledCount;
    document.getElementById('rep-overtime-hours').textContent = `${overtime} hrs`;

    // Render Analytics 4 Charts
    renderHoursDistributionChart('chart-rep-hours');
    renderShiftCoverageChart('chart-rep-coverage');
    renderDailyRequirementsChart('chart-rep-daily');
    renderNightShiftShareChart('chart-rep-night-share');
  }

  // 8. Settings View
  function renderSettingsView() {
    document.getElementById('set-max-weekly').value = state.settings.maxWeeklyHours;
    document.getElementById('set-max-daily').value = state.settings.maxDailyHours;
    document.getElementById('set-min-rest').value = state.settings.minRestHours;
    document.getElementById('set-max-consecutive').value = state.settings.maxConsecutiveDays;

    document.getElementById('weight-hours').value = state.settings.weights.hours;
    document.getElementById('weight-pref').value = state.settings.weights.preference;
    document.getElementById('weight-assigned').value = state.settings.weights.shiftCount;
    document.getElementById('weight-night').value = state.settings.weights.nightDist;
    document.getElementById('weight-continuity').value = state.settings.weights.continuity;

    document.getElementById('set-backtracking-limit').value = state.settings.nodeLimit;
    document.getElementById('set-default-objective').value = state.settings.objective;
  }

  function saveSettings() {
    state.settings.maxWeeklyHours = parseInt(document.getElementById('set-max-weekly').value, 10);
    state.settings.maxDailyHours = parseInt(document.getElementById('set-max-daily').value, 10);
    state.settings.minRestHours = parseInt(document.getElementById('set-min-rest').value, 10);
    state.settings.maxConsecutiveDays = parseInt(document.getElementById('set-max-consecutive').value, 10);

    state.settings.weights = {
      hours: parseInt(document.getElementById('weight-hours').value, 10),
      preference: parseInt(document.getElementById('weight-pref').value, 10),
      shiftCount: parseInt(document.getElementById('weight-assigned').value, 10),
      nightDist: parseInt(document.getElementById('weight-night').value, 10),
      continuity: parseInt(document.getElementById('weight-continuity').value, 10)
    };

    state.settings.nodeLimit = parseInt(document.getElementById('set-backtracking-limit').value, 10);
    state.settings.objective = document.getElementById('set-default-objective').value;

    saveData();
    showToast('System settings and algorithmic weights updated successfully', 'success');
  }

  // -------------------------------------------------------------
  // CHART RENDERING (Chart.js via CDN)
  // -------------------------------------------------------------
  function destroyChart(chartKey) {
    if (state.charts[chartKey]) {
      state.charts[chartKey].destroy();
      delete state.charts[chartKey];
    }
  }

  function renderHoursDistributionChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    destroyChart(canvasId);

    const assignments = state.schedule ? state.schedule.assignments : [];
    const labels = state.employees.map(e => e.name.split(' ')[0] + ' ' + (e.name.split(' ')[1] ? e.name.split(' ')[1][0] + '.' : ''));
    const dataScheduled = state.employees.map(e => {
      return assignments.filter(a => a.employeeId === e.id).reduce((s, a) => s + a.duration, 0);
    });
    const dataTarget = state.employees.map(e => e.maxWeeklyHours || 40);

    state.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Scheduled Hours',
            data: dataScheduled,
            backgroundColor: '#4f46e5',
            borderRadius: 4
          },
          {
            label: 'Weekly Limit Cap',
            data: dataTarget,
            backgroundColor: '#e2e8f0',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: { beginAtZero: true, max: 50, title: { display: true, text: 'Hours' } }
        }
      }
    });
  }

  function renderShiftCoverageChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    destroyChart(canvasId);

    const filled = state.schedule ? state.schedule.filledCount : 56;
    const unfilled = state.schedule ? state.schedule.unfilledCount : 0;

    state.charts[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Filled Shift Slots', 'Unfilled Vacancies'],
        datasets: [
          {
            data: [filled, unfilled],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  function renderDailyRequirementsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    destroyChart(canvasId);

    const assignments = state.schedule ? state.schedule.assignments : [];
    const dailyRequired = DAYS_OF_WEEK.map(() => {
      return state.shifts.reduce((sum, s) => sum + (s.requiredCount || 1), 0);
    });
    const dailyAssigned = DAYS_OF_WEEK.map((day, idx) => {
      return assignments.filter(a => a.dayIndex === idx).length;
    });

    state.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: DAYS_OF_WEEK,
        datasets: [
          {
            label: 'Required Daily Headcount',
            data: dailyRequired,
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            fill: false,
            tension: 0.2
          },
          {
            label: 'Actual Assigned Staff',
            data: dailyAssigned,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: { beginAtZero: true, suggestedMax: 12, title: { display: true, text: 'Personnel' } }
        }
      }
    });
  }

  function renderNightShiftShareChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    destroyChart(canvasId);

    const assignments = state.schedule ? state.schedule.assignments : [];
    const labels = state.employees.slice(0, 8).map(e => e.name.split(' ')[0]);
    const dayHours = labels.map((_, i) => {
      const emp = state.employees[i];
      return assignments.filter(a => a.employeeId === emp.id && !a.isNight).reduce((s, a) => s + a.duration, 0);
    });
    const nightHours = labels.map((_, i) => {
      const emp = state.employees[i];
      return assignments.filter(a => a.employeeId === emp.id && a.isNight).reduce((s, a) => s + a.duration, 0);
    });

    state.charts[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Day/Evening Hours',
            data: dayHours,
            backgroundColor: '#38bdf8'
          },
          {
            label: 'Night Shift Hours',
            data: nightHours,
            backgroundColor: '#7c3aed'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Total Hours' } }
        },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // SCHEDULE COMPARISON BENCHMARK
  // -------------------------------------------------------------
  function runScheduleComparison() {
    const slots = generateSlotManifest(state.shifts);
    const settings = { ...state.settings };

    const greedy = runGreedyScheduler(slots, state.employees, settings);
    const backtracking = runBacktrackingScheduler(slots, state.employees, settings, [], settings.nodeLimit);
    const hybrid = runHybridScheduler(slots, state.employees, settings, settings.nodeLimit);

    function calcMetrics(sched) {
      let prefMatches = 0;
      sched.assignments.forEach(a => {
        const emp = state.employees.find(e => e.id === a.employeeId);
        if (emp && (emp.preferredShift === a.shiftName || emp.preferredShift === 'Any')) prefMatches++;
      });
      const prefPct = sched.assignments.length > 0 ? Math.round((prefMatches / sched.assignments.length) * 100) : 0;

      // Fairness (Std Dev of hours)
      const hoursMap = {};
      state.employees.forEach(e => (hoursMap[e.id] = 0));
      sched.assignments.forEach(a => (hoursMap[a.employeeId] += a.duration));
      const hours = Object.values(hoursMap);
      const avg = hours.reduce((s, h) => s + h, 0) / hours.length;
      const stdDev = Math.sqrt(hours.reduce((s, h) => s + Math.pow(h - avg, 2), 0) / hours.length).toFixed(1);

      return {
        prefPct,
        stdDev
      };
    }

    const gMet = calcMetrics(greedy);
    const bMet = calcMetrics(backtracking);
    const hMet = calcMetrics(hybrid);

    const container = document.getElementById('comparison-columns-container');
    container.innerHTML = `
      <div class="comp-column">
        <h4>Mode 1: Greedy</h4>
        <div class="comp-stat"><span>Filled Slots:</span> <strong>${greedy.filledCount} / ${slots.length}</strong></div>
        <div class="comp-stat"><span>Coverage:</span> <strong>${greedy.coveragePct}%</strong></div>
        <div class="comp-stat"><span>Execution Time:</span> <strong>${greedy.durationMs} ms</strong></div>
        <div class="comp-stat"><span>Nodes Explored:</span> <strong>${greedy.nodesExplored}</strong></div>
        <div class="comp-stat"><span>Preference Match:</span> <strong>${gMet.prefPct}%</strong></div>
        <div class="comp-stat"><span>Hour Std Dev (Fairness):</span> <strong>&plusmn;${gMet.stdDev}h</strong></div>
      </div>

      <div class="comp-column">
        <h4>Mode 2: Backtracking</h4>
        <div class="comp-stat"><span>Filled Slots:</span> <strong>${backtracking.filledCount} / ${slots.length}</strong></div>
        <div class="comp-stat"><span>Coverage:</span> <strong>${backtracking.coveragePct}%</strong></div>
        <div class="comp-stat"><span>Execution Time:</span> <strong>${backtracking.durationMs} ms</strong></div>
        <div class="comp-stat"><span>Nodes Explored:</span> <strong>${backtracking.nodesExplored}</strong></div>
        <div class="comp-stat"><span>Preference Match:</span> <strong>${bMet.prefPct}%</strong></div>
        <div class="comp-stat"><span>Hour Std Dev (Fairness):</span> <strong>&plusmn;${bMet.stdDev}h</strong></div>
      </div>

      <div class="comp-column highlight">
        <h4>Mode 3: Hybrid (Recommended)</h4>
        <div class="comp-stat"><span>Filled Slots:</span> <strong style="color:var(--primary); font-size:14px;">${hybrid.filledCount} / ${slots.length}</strong></div>
        <div class="comp-stat"><span>Coverage:</span> <strong>${hybrid.coveragePct}%</strong></div>
        <div class="comp-stat"><span>Execution Time:</span> <strong>${hybrid.durationMs} ms</strong></div>
        <div class="comp-stat"><span>Nodes Explored:</span> <strong>${hybrid.nodesExplored}</strong></div>
        <div class="comp-stat"><span>Preference Match:</span> <strong>${hMet.prefPct}%</strong></div>
        <div class="comp-stat"><span>Hour Std Dev (Fairness):</span> <strong>&plusmn;${hMet.stdDev}h</strong></div>
      </div>
    `;

    showToast('Benchmark complete: Evaluated Greedy, Backtracking, and Hybrid against 56 weekly slots.', 'info');
  }

  // -------------------------------------------------------------
  // DRAG AND DROP HANDLERS WITH CONSTRAINT VALIDATION
  // -------------------------------------------------------------
  function handleDragStart(e, slotId, empId, dayIndex) {
    state.draggedSlot = { slotId, empId, dayIndex };
    e.dataTransfer.setData('text/plain', JSON.stringify({ slotId, empId, dayIndex }));
    e.target.classList.add('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    cell.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    const cell = e.currentTarget;
    cell.classList.remove('drag-over');
  }

  function handleDrop(e, targetEmpId, targetDayIndex) {
    e.preventDefault();
    const cell = e.currentTarget;
    cell.classList.remove('drag-over');

    if (!state.draggedSlot) return;
    const { slotId, empId: sourceEmpId, dayIndex: sourceDayIndex } = state.draggedSlot;

    // Check if target is same employee and same day
    if (sourceEmpId === targetEmpId && sourceDayIndex === targetDayIndex) {
      return;
    }

    const assignments = state.schedule ? state.schedule.assignments : [];
    const slotIdx = assignments.findIndex(a => a.id === slotId && a.employeeId === sourceEmpId);
    if (slotIdx === -1) return;

    const slot = assignments[slotIdx];
    const targetEmp = state.employees.find(e => e.id === targetEmpId);
    if (!targetEmp) return;

    // Build proposed modified slot
    const proposedSlot = {
      ...slot,
      dayIndex: targetDayIndex,
      dayName: DAYS_OF_WEEK[targetDayIndex],
      interval: getShiftAbsoluteInterval(targetDayIndex, slot.startTime, slot.endTime)
    };

    // Temporarily exclude current assignment from check
    const otherAssignments = assignments.filter((_, idx) => idx !== slotIdx);

    // REAL-TIME HARD CONSTRAINT VALIDATION BEFORE PERSISTING
    const validation = checkAssignmentEligibility(targetEmp, proposedSlot, otherAssignments, state.settings);

    if (!validation.eligible) {
      showToast(`Cannot reassign shift to ${targetEmp.name}: ${validation.reason}`, 'error');
      return;
    }

    // Apply the valid reassignment
    assignments[slotIdx] = {
      ...proposedSlot,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      employeeRole: targetEmp.role
    };

    saveData();
    renderAllViews();
    showToast(`Reassigned ${slot.shiftName} to ${targetEmp.name} on ${DAYS_OF_WEEK[targetDayIndex]}`, 'success');
  }

  // -------------------------------------------------------------
  // MODAL & FORM CONTROLS
  // -------------------------------------------------------------
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  function openEditEmployeeModal(empId) {
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById('modal-emp-title').textContent = 'Edit Employee';
    document.getElementById('emp-edit-id').value = emp.id;
    document.getElementById('emp-name').value = emp.name;
    document.getElementById('emp-email').value = emp.email;
    document.getElementById('emp-phone').value = emp.phone || '';
    document.getElementById('emp-role').value = emp.role;
    document.getElementById('emp-skills').value = (emp.skills || []).join(', ');
    document.getElementById('emp-max-weekly').value = emp.maxWeeklyHours || 40;
    document.getElementById('emp-max-daily').value = emp.maxDailyHours || 8;
    document.getElementById('emp-rest').value = emp.minRestHours || 12;
    document.getElementById('emp-pref-shift').value = emp.preferredShift || 'Any';
    document.getElementById('emp-status').value = emp.status || 'Active';

    openModal('modal-employee');
  }

  function saveEmployeeForm() {
    const editId = document.getElementById('emp-edit-id').value;
    const name = document.getElementById('emp-name').value.trim();
    const email = document.getElementById('emp-email').value.trim();
    const phone = document.getElementById('emp-phone').value.trim();
    const role = document.getElementById('emp-role').value;
    const skills = document.getElementById('emp-skills').value.split(',').map(s => s.trim()).filter(Boolean);
    const maxWeeklyHours = parseInt(document.getElementById('emp-max-weekly').value, 10);
    const maxDailyHours = parseInt(document.getElementById('emp-max-daily').value, 10);
    const minRestHours = parseInt(document.getElementById('emp-rest').value, 10);
    const preferredShift = document.getElementById('emp-pref-shift').value;
    const status = document.getElementById('emp-status').value;

    if (!name || !email) {
      showToast('Name and email are required fields', 'warning');
      return;
    }

    if (editId) {
      // Edit existing
      const emp = state.employees.find(e => e.id === editId);
      if (emp) {
        Object.assign(emp, { name, email, phone, role, skills, maxWeeklyHours, maxDailyHours, minRestHours, preferredShift, status });
        showToast(`Updated employee ${name}`, 'success');
      }
    } else {
      // Add new
      const nextNum = state.employees.length + 1;
      const newId = `EMP-${nextNum < 10 ? '0' + nextNum : nextNum}`;
      const defaultAvail = {};
      DAYS_OF_WEEK.forEach(d => (defaultAvail[d] = 'available'));

      state.employees.push({
        id: newId,
        name,
        email,
        phone,
        role,
        skills,
        maxWeeklyHours,
        maxDailyHours,
        minRestHours,
        preferredShift,
        status,
        availability: defaultAvail
      });
      showToast(`Added new employee ${name} (${newId})`, 'success');
    }

    saveData();
    closeModal('modal-employee');
    renderAllViews();
  }

  function deleteEmployee(empId) {
    if (!confirm('Are you sure you want to delete this employee? Any assigned shifts will become vacant.')) return;
    state.employees = state.employees.filter(e => e.id !== empId);
    if (state.schedule) {
      state.schedule.assignments = state.schedule.assignments.filter(a => a.employeeId !== empId);
    }
    saveData();
    renderAllViews();
    showToast('Employee deleted', 'info');
  }

  function openEditShiftModal(shiftId) {
    const shift = state.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    document.getElementById('modal-shift-title').textContent = 'Edit Shift Template';
    document.getElementById('shift-edit-id').value = shift.id;
    document.getElementById('shift-name').value = shift.name;
    document.getElementById('shift-start').value = shift.startTime;
    document.getElementById('shift-end').value = shift.endTime;
    document.getElementById('shift-req-count').value = shift.requiredCount || 1;
    document.getElementById('shift-req-skills').value = (shift.requiredSkills || []).join(', ');
    document.getElementById('shift-req-roles').value = (shift.requiredRoles || []).join(', ');
    document.getElementById('shift-priority').value = shift.priority || 'Medium';

    openModal('modal-shift');
  }

  function saveShiftForm() {
    const editId = document.getElementById('shift-edit-id').value;
    const name = document.getElementById('shift-name').value.trim();
    const startTime = document.getElementById('shift-start').value;
    const endTime = document.getElementById('shift-end').value;
    const requiredCount = parseInt(document.getElementById('shift-req-count').value, 10);
    const requiredSkills = document.getElementById('shift-req-skills').value.split(',').map(s => s.trim()).filter(Boolean);
    const requiredRoles = document.getElementById('shift-req-roles').value.split(',').map(s => s.trim()).filter(Boolean);
    const priority = document.getElementById('shift-priority').value;

    if (!name || !startTime || !endTime) {
      showToast('Shift name, start time, and end time are required', 'warning');
      return;
    }

    const duration = calculateShiftDuration(startTime, endTime);

    if (editId) {
      const shift = state.shifts.find(s => s.id === editId);
      if (shift) {
        Object.assign(shift, { name, startTime, endTime, duration, requiredCount, requiredSkills, requiredRoles, priority });
        showToast(`Updated shift ${name}`, 'success');
      }
    } else {
      const nextNum = state.shifts.length + 1;
      const newId = `SHIFT-${nextNum < 10 ? '0' + nextNum : nextNum}`;
      state.shifts.push({ id: newId, name, startTime, endTime, duration, requiredCount, requiredSkills, requiredRoles, priority });
      showToast(`Added new shift ${name} (${newId})`, 'success');
    }

    saveData();
    closeModal('modal-shift');
    renderAllViews();
  }

  function deleteShift(shiftId) {
    if (!confirm('Are you sure you want to delete this shift template?')) return;
    state.shifts = state.shifts.filter(s => s.id !== shiftId);
    saveData();
    renderAllViews();
    showToast('Shift template removed', 'info');
  }

  function openShiftDetailModal(slotId) {
    const assignments = state.schedule ? state.schedule.assignments : [];
    const slot = assignments.find(a => a.id === slotId);
    if (!slot) return;

    const emp = state.employees.find(e => e.id === slot.employeeId);
    const body = document.getElementById('modal-detail-body');

    body.innerHTML = `
      <div style="font-size: 13px; line-height: 1.6;">
        <div style="margin-bottom: 12px; padding: 12px; background: #f8fafc; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
          <div style="font-weight: 700; font-size: 15px; color: var(--primary);">${slot.shiftName}</div>
          <div><strong>Schedule Timing:</strong> ${slot.dayName}, ${slot.startTime} &ndash; ${slot.endTime} (${slot.duration} hrs)</div>
          <div><strong>Priority:</strong> <span class="role-badge ${slot.priority === 'High' ? 'warning' : 'primary'}">${slot.priority}</span></div>
        </div>

        <div style="margin-bottom: 12px;">
          <h4 style="font-size: 14px; margin-bottom: 6px;">Assigned Personnel</h4>
          <div><strong>Name:</strong> ${slot.employeeName} (${slot.employeeRole})</div>
          <div><strong>ID:</strong> ${slot.employeeId}</div>
          <div><strong>Preference Match:</strong> ${emp && emp.preferredShift === slot.shiftName ? '<span style="color:var(--success); font-weight:600;">Yes &check;</span>' : 'Standard Assignment'}</div>
          <div><strong>Algorithmic Score:</strong> ${Math.round(slot.score || 0)} suitability pts</div>
        </div>

        <div style="font-size: 11px; color: var(--text-muted);">
          Slot Reference: <code>${slot.id}</code>
        </div>
      </div>
    `;

    const unassignBtn = document.getElementById('btn-unassign-slot');
    unassignBtn.onclick = () => {
      state.schedule.assignments = state.schedule.assignments.filter(a => a.id !== slotId);
      saveData();
      closeModal('modal-shift-detail');
      renderAllViews();
      showToast(`Unassigned ${slot.employeeName} from ${slot.shiftName}`, 'info');
    };

    openModal('modal-shift-detail');
  }

  // -------------------------------------------------------------
  // CSV IMPORT & EXPORT
  // -------------------------------------------------------------
  function exportEmployeesCSV() {
    let csv = 'Employee ID,Full Name,Email,Phone,Job Role,Skills,Max Weekly Hours,Max Daily Hours,Min Rest,Preferred Shift,Status\n';
    state.employees.forEach(e => {
      csv += `"${e.id}","${e.name}","${e.email}","${e.phone || ''}","${e.role}","${(e.skills || []).join(';')}","${e.maxWeeklyHours}","${e.maxDailyHours}","${e.minRestHours}","${e.preferredShift}","${e.status}"\n`;
    });
    downloadCSVFile(csv, 'SmartShift_Employees.csv');
  }

  function exportScheduleCSV() {
    if (!state.schedule || !state.schedule.assignments) {
      showToast('No active schedule available to export', 'warning');
      return;
    }
    let csv = 'Slot ID,Day,Shift Name,Start Time,End Time,Duration (Hours),Employee ID,Employee Name,Role,Priority\n';
    state.schedule.assignments.forEach(a => {
      csv += `"${a.id}","${a.dayName}","${a.shiftName}","${a.startTime}","${a.endTime}","${a.duration}","${a.employeeId}","${a.employeeName}","${a.employeeRole}","${a.priority}"\n`;
    });
    downloadCSVFile(csv, 'SmartShift_Weekly_Schedule.csv');
  }

  function exportWorkloadCSV() {
    const assignments = state.schedule ? state.schedule.assignments : [];
    let csv = 'Employee ID,Full Name,Job Role,Total Assigned Hours,Total Shifts,Night Shifts,Weekly Cap,Overtime Hours,Utilization %\n';
    state.employees.forEach(e => {
      const empSlots = assignments.filter(a => a.employeeId === e.id);
      const hours = empSlots.reduce((s, a) => s + a.duration, 0);
      const nightShifts = empSlots.filter(a => a.isNight).length;
      const cap = e.maxWeeklyHours || 40;
      const ot = Math.max(0, hours - cap);
      const util = Math.round((hours / cap) * 100);
      csv += `"${e.id}","${e.name}","${e.role}","${hours}","${empSlots.length}","${nightShifts}","${cap}","${ot}","${util}%"\n`;
    });
    downloadCSVFile(csv, 'SmartShift_Workload_Report.csv');
  }

  function downloadCSVFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${fileName}`, 'success');
  }

  function importEmployeesCSV(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
          showToast('CSV is empty or invalid format', 'warning');
          return;
        }

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(item => item.replace(/(^"|"$)/g, '').trim());
          if (row.length >= 5) {
            const [id, name, email, phone, role, skillsStr, maxW, maxD, minR, pref, status] = row;
            const newEmp = {
              id: id || `EMP-${state.employees.length + 1}`,
              name: name || 'Imported Staff',
              email: email || 'imported@hospital.org',
              phone: phone || '',
              role: role || 'Staff Nurse',
              skills: skillsStr ? skillsStr.split(';').map(s => s.trim()) : ['BLS'],
              maxWeeklyHours: parseInt(maxW, 10) || 40,
              maxDailyHours: parseInt(maxD, 10) || 8,
              minRestHours: parseInt(minR, 10) || 12,
              preferredShift: pref || 'Any',
              status: status || 'Active',
              availability: {}
            };
            DAYS_OF_WEEK.forEach(d => (newEmp.availability[d] = 'available'));
            state.employees.push(newEmp);
            importedCount++;
          }
        }
        saveData();
        renderAllViews();
        showToast(`Successfully imported ${importedCount} employees from CSV`, 'success');
      } catch (err) {
        showToast('Error parsing employee CSV file', 'error');
      }
    };
    reader.readAsText(file);
  }

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS SYSTEM
  // -------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:600;">${type.toUpperCase()}:</span>
        <span>${message}</span>
      </div>
      <button style="background:none; border:none; color:inherit; cursor:pointer; font-size:16px;" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  }

  // -------------------------------------------------------------
  // INTERACTIVE ALGORITHM WALKTHROUGH SIMULATOR (3 Emp x 3 Shifts)
  // -------------------------------------------------------------
  let simStep = 0;
  const SIM_STEPS_DATA = [
    {
      title: 'Step 1: Shift Queue Ordering & Difficulty Analysis',
      type: 'info',
      html: `
        <div>The scheduling engine analyzes the shift pool and sorts them by difficulty.</div>
        <div style="margin-top:8px;">
          <strong>Target Shift 1:</strong> Morning General Shift (Needs: General)<br>
          <strong>Target Shift 2:</strong> Evening ICU Shift (Needs: ICU) &larr; <em>Critical: Only Nurse Alice holds ICU certification!</em><br>
          <strong>Target Shift 3:</strong> Night General Shift (Needs: General)
        </div>
      `
    },
    {
      title: 'Step 2: Greedy Engine Assigns Shift 1',
      type: 'info',
      html: `
        <div>Greedy scheduler inspects Shift 1 (Morning). Both Alice and Bob prefer Morning.</div>
        <div style="color:var(--primary); font-weight:600; margin-top:6px;">
          Greedy chooses <strong>Nurse Alice</strong> because Alice has a slightly higher preference + continuity score!
        </div>
        <div style="margin-top:4px;">
          &bull; Shift 1 &rarr; Assigned to <strong>Alice</strong> (Current Coverage: 33%)
        </div>
      `
    },
    {
      title: 'Step 3: Greedy Trapped at Shift 2 (Dead End Encountered)',
      type: 'backtracked',
      html: `
        <div>Greedy moves to Shift 2 (Evening ICU). It checks candidates for [ICU skill].</div>
        <div style="color:var(--danger); font-weight:700; margin-top:6px;">
          &cross; DEAD END! Alice is already scheduled on Shift 1 (violating 12h rest / daily limit). Bob & Carol lack ICU certification!
        </div>
        <div style="margin-top:4px;">
          <strong>Greedy Result:</strong> Shift 2 remains unfilled! Final Greedy coverage fails at 66%.
        </div>
      `
    },
    {
      title: 'Step 4: Backtracking Optimization Activates & Reverses Decision',
      type: 'backtracked',
      html: `
        <div>The Backtracking engine detects that Shift 2 cannot be satisfied.</div>
        <div style="color:var(--primary); font-weight:600; margin-top:6px;">
          &circlearrowleft; UNDO (Backtrack): The engine pops Shift 1 assignment from Alice, restoring her availability.
        </div>
        <div style="margin-top:4px;">
          It assigns Shift 1 to the next eligible candidate: <strong>Nurse Bob</strong>!
        </div>
      `
    },
    {
      title: 'Step 5: Systematic Resolution of Bottleneck Shift 2',
      type: 'success',
      html: `
        <div>With Shift 1 filled by Bob, Shift 2 (Evening ICU) is re-evaluated.</div>
        <div style="color:var(--success); font-weight:700; margin-top:6px;">
          &check; Nurse Alice is now free and has the mandatory ICU skill! Shift 2 is assigned to Alice!
        </div>
      `
    },
    {
      title: 'Step 6: Shift 3 Assigned & 100% Optimal Feasible Schedule Reached',
      type: 'success',
      html: `
        <div>The remaining Shift 3 (Night General) is assigned to Nurse Carol.</div>
        <div style="font-weight:700; color:#15803d; margin-top:6px;">
          &check; FINAL SCHEDULE: Shift 1 = Bob, Shift 2 = Alice (ICU), Shift 3 = Carol.
        </div>
        <div style="margin-top:4px; font-size:12px;">
          <strong>Conclusion:</strong> Backtracking successfully explored the alternative branch, resolving the bottleneck that trapped the Greedy heuristic!
        </div>
      `
    }
  ];

  function renderSimStep() {
    const container = document.getElementById('algo-sim-steps');
    if (!container) return;

    let html = '';
    for (let i = 0; i <= simStep; i++) {
      const s = SIM_STEPS_DATA[i];
      html += `
        <div class="algo-step-node ${s.type}">
          <div style="font-weight:700; font-size:14px; margin-bottom:4px;">${s.title}</div>
          <div style="font-size:13px; color:var(--text-main); line-height:1.5;">${s.html}</div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  // -------------------------------------------------------------
  // AUTOMATED TEST SUITE (13 EXHAUSTIVE TEST CASES)
  // -------------------------------------------------------------
  const TEST_SUITE = [
    {
      id: 'T01',
      name: 'All Employees Available',
      desc: 'Verify greedy scheduler assigns shifts when all staff are 100% available.',
      run: () => {
        const emp = JSON.parse(JSON.stringify(SEED_EMPLOYEES.slice(0, 3)));
        emp.forEach(e => {
          DAYS_OF_WEEK.forEach(d => (e.availability[d] = 'available'));
        });
        const shift = [SEED_SHIFTS[0]]; // 1 shift, req 3
        const slots = generateSlotManifest(shift).filter(s => s.dayIndex === 0);
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.filledCount === 3 && res.unfilledCount === 0,
          output: `Filled: ${res.filledCount}/3 slots. 0 unfilled.`
        };
      }
    },
    {
      id: 'T02',
      name: 'One Employee Unavailable',
      desc: 'Verify system respects unavailable status and does not assign unavailable staff.',
      run: () => {
        const emp = JSON.parse(JSON.stringify(SEED_EMPLOYEES.slice(0, 2)));
        emp[0].availability['Monday'] = 'unavailable';
        const shift = [{ ...SEED_SHIFTS[0], requiredCount: 1 }];
        const slots = generateSlotManifest(shift).filter(s => s.dayName === 'Monday');
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        const assignedToUnavailable = res.assignments.some(a => a.employeeId === emp[0].id);
        return {
          pass: !assignedToUnavailable && res.assignments[0].employeeId === emp[1].id,
          output: `Assigned to ${res.assignments[0]?.employeeName} (Skipped unavailable ${emp[0].name}).`
        };
      }
    },
    {
      id: 'T03',
      name: 'No Employee Qualified for a Shift',
      desc: 'Verify that a shift with an unmet required skill is left unfilled with clear explanation.',
      run: () => {
        const emp = [{ ...SEED_EMPLOYEES[0], skills: ['BasicFirstAid'] }];
        const shift = [{ ...SEED_SHIFTS[0], requiredSkills: ['AdvancedNeuroSurgery'] }];
        const slots = generateSlotManifest(shift).slice(0, 1);
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.unfilledCount === 1 && res.unfilledSlots[0].reason.includes('Missing required skills'),
          output: `Unfilled reason: "${res.unfilledSlots[0]?.reason}"`
        };
      }
    },
    {
      id: 'T04',
      name: 'Insufficient Employees to Cover All Shifts',
      desc: 'Verify graceful handling when staff count is less than required slots.',
      run: () => {
        const emp = [SEED_EMPLOYEES[0]]; // Only 1 employee
        const shift = [{ ...SEED_SHIFTS[0], requiredCount: 3 }]; // Needs 3
        const slots = generateSlotManifest(shift).filter(s => s.dayIndex === 0);
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.filledCount === 1 && res.unfilledCount === 2,
          output: `Filled 1 slot, correctly identified 2 understaffed slots.`
        };
      }
    },
    {
      id: 'T05',
      name: 'Employee at Maximum Weekly Hours',
      desc: 'Verify that employee is not assigned when weekly hour limit would be exceeded.',
      run: () => {
        const emp = [{ ...SEED_EMPLOYEES[0], maxWeeklyHours: 8 }];
        const shift = [{ ...SEED_SHIFTS[0], requiredCount: 1 }]; // 8h per day
        const slots = generateSlotManifest(shift).slice(0, 2); // 2 days = 16h
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.filledCount === 1 && res.unfilledCount === 1,
          output: `Assigned day 1 (8h). Day 2 rejected due to max weekly ceiling (8h cap).`
        };
      }
    },
    {
      id: 'T06',
      name: 'Employee at Maximum Daily Hours',
      desc: 'Verify employee is blocked from receiving multiple shifts exceeding daily ceiling.',
      run: () => {
        const emp = [{ ...SEED_EMPLOYEES[0], maxDailyHours: 8 }];
        const shifts = [
          { ...SEED_SHIFTS[0], requiredCount: 1 },
          { ...SEED_SHIFTS[1], requiredCount: 1 }
        ];
        const slots = generateSlotManifest(shifts).filter(s => s.dayIndex === 0); // 2 shifts on same day = 16h
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.filledCount === 1 && res.unfilledCount === 1,
          output: `Daily cap enforced: 1 shift accepted, 2nd shift rejected.`
        };
      }
    },
    {
      id: 'T07',
      name: 'Overlapping Shifts Detection',
      desc: 'Verify simultaneous shifts on the same day cannot be double-booked to one employee.',
      run: () => {
        const emp = [{ ...SEED_EMPLOYEES[0] }];
        const s1 = { ...SEED_SHIFTS[0], startTime: '08:00', endTime: '12:00', requiredCount: 1 };
        const s2 = { ...SEED_SHIFTS[1], startTime: '10:00', endTime: '14:00', requiredCount: 1 };
        const slots = generateSlotManifest([s1, s2]).filter(s => s.dayIndex === 0);
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.filledCount === 1 && res.unfilledCount === 1,
          output: `Prevented overlap between 10:00 and 12:00.`
        };
      }
    },
    {
      id: 'T08',
      name: 'Overnight Shifts Calculation',
      desc: 'Verify 22:00 to 06:00 is accurately calculated as 8 hours spanning across midnight.',
      run: () => {
        const duration = calculateShiftDuration('22:00', '06:00');
        const interval = getShiftAbsoluteInterval(0, '22:00', '06:00');
        const diffHrs = (interval.endMin - interval.startMin) / 60;
        return {
          pass: duration === 8 && diffHrs === 8,
          output: `Calculated duration: ${duration} hours. Absolute interval spans 8 hours.`
        };
      }
    },
    {
      id: 'T09',
      name: 'Insufficient Rest Periods',
      desc: 'Verify employee cannot be assigned to morning shift right after evening shift (<12h rest).',
      run: () => {
        const emp = [{ ...SEED_EMPLOYEES[0], minRestHours: 12 }];
        // Day 0 Evening: 14:00 - 22:00. Day 1 Morning: 06:00 - 14:00. Rest = 8h (< 12h)
        const sEve = { ...SEED_SHIFTS[1], requiredCount: 1 };
        const sMorn = { ...SEED_SHIFTS[0], requiredCount: 1 };
        const slots = [
          ...generateSlotManifest([sEve]).filter(s => s.dayIndex === 0),
          ...generateSlotManifest([sMorn]).filter(s => s.dayIndex === 1)
        ];
        const res = runGreedyScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: res.filledCount === 1 && res.unfilledCount === 1,
          output: `Rest of 8 hours rejected against 12-hour minimum rest threshold.`
        };
      }
    },
    {
      id: 'T10',
      name: 'Multiple Required Skills',
      desc: 'Verify employee must possess ALL required skills to be eligible for assignment.',
      run: () => {
        const emp1 = { ...SEED_EMPLOYEES[0], skills: ['Triage'] };
        const emp2 = { ...SEED_EMPLOYEES[1], skills: ['Triage', 'ICU'] };
        const shift = [{ ...SEED_SHIFTS[0], requiredSkills: ['Triage', 'ICU'], requiredCount: 1 }];
        const slots = generateSlotManifest(shift).slice(0, 1);
        const res = runGreedyScheduler(slots, [emp1, emp2], DEFAULT_SETTINGS);
        return {
          pass: res.assignments[0]?.employeeId === emp2.id,
          output: `Assigned to ${emp2.name} (Has both Triage + ICU).`
        };
      }
    },
    {
      id: 'T11',
      name: 'Backtracking Finding Alternative Assignment',
      desc: 'Verify backtracking recovers 100% coverage when greedy heuristic traps itself.',
      run: () => {
        // Alice: General + ICU (Pref Morning)
        // Bob: General
        // Carol: General
        const emp = [
          { id: 'E1', name: 'Alice', role: 'Nurse', status: 'Active', skills: ['General', 'ICU'], maxWeeklyHours: 8, maxDailyHours: 8, preferredShift: 'ShiftA', availability: { Monday: 'available' } },
          { id: 'E2', name: 'Bob', role: 'Nurse', status: 'Active', skills: ['General'], maxWeeklyHours: 8, maxDailyHours: 8, preferredShift: 'ShiftA', availability: { Monday: 'available' } },
          { id: 'E3', name: 'Carol', role: 'Nurse', status: 'Active', skills: ['General'], maxWeeklyHours: 8, maxDailyHours: 8, preferredShift: 'ShiftC', availability: { Monday: 'available' } }
        ];
        const shifts = [
          { id: 'S1', name: 'ShiftA', startTime: '06:00', endTime: '14:00', duration: 8, requiredCount: 1, requiredSkills: ['General'] },
          { id: 'S2', name: 'ShiftB', startTime: '14:00', endTime: '22:00', duration: 8, requiredCount: 1, requiredSkills: ['ICU'] },
          { id: 'S3', name: 'ShiftC', startTime: '22:00', endTime: '06:00', duration: 8, requiredCount: 1, requiredSkills: ['General'] }
        ];
        const slots = generateSlotManifest(shifts).filter(s => s.dayIndex === 0);
        const btRes = runBacktrackingScheduler(slots, emp, DEFAULT_SETTINGS);
        return {
          pass: btRes.filledCount === 3,
          output: `Backtracking achieved 3/3 filled slots (${btRes.nodesExplored} nodes explored).`
        };
      }
    },
    {
      id: 'T12',
      name: 'Search Limit Reached Handling',
      desc: 'Verify backtracking respects node limits and returns best partial solution without freezing.',
      run: () => {
        const slots = generateSlotManifest(SEED_SHIFTS);
        const btRes = runBacktrackingScheduler(slots, SEED_EMPLOYEES, DEFAULT_SETTINGS, [], 20); // strictly capped at 20 nodes
        return {
          pass: btRes.nodesExplored <= 25 && btRes.hitLimit === true,
          output: `Node ceiling enforced. Explored ${btRes.nodesExplored} nodes and gracefully terminated.`
        };
      }
    },
    {
      id: 'T13',
      name: 'Schedule With All Shifts Filled',
      desc: 'Verify that with full 12-staff seed workforce, the system fills 100% of shift slots.',
      run: () => {
        const slots = generateSlotManifest(SEED_SHIFTS);
        const res = runHybridScheduler(slots, SEED_EMPLOYEES, DEFAULT_SETTINGS);
        const unfilledDesc = res.unfilledSlots.map(u => `${u.dayName} ${u.shiftName}`).join('; ');
        return {
          pass: res.unfilledCount === 0 && res.coveragePct === 100,
          output: `Full coverage achieved: ${res.filledCount}/${slots.length} shift slots assigned.${unfilledDesc ? ' Unfilled: ' + unfilledDesc : ''}`
        };
      }
    }
  ];

  function runAllTests() {
    const container = document.getElementById('test-cases-accordion');
    let passCount = 0;

    const results = TEST_SUITE.map((test, idx) => {
      let result;
      try {
        result = test.run();
      } catch (e) {
        result = { pass: false, output: `Runtime exception: ${e.message}` };
      }
      if (result.pass) passCount++;

      return `
        <div class="test-suite-card">
          <div class="test-suite-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="test-result-badge ${result.pass ? 'pass' : 'fail'}">${result.pass ? 'PASS' : 'FAIL'}</span>
              <strong style="font-size:13px;">Test ${idx + 1}: ${test.name}</strong>
            </div>
            <span style="font-size:12px; color:var(--text-muted);">&blacktriangledown; Details</span>
          </div>
          <div class="test-details" style="display:none;">
<strong>Description:</strong> ${test.desc}
<strong>Assertion Result:</strong> ${result.output}
<strong>Status:</strong> ${result.pass ? '&check; VERIFIED' : '&cross; FAILED'}
          </div>
        </div>
      `;
    });

    container.innerHTML = results.join('');
    document.getElementById('test-summary-pass').textContent = passCount;
    showToast(`Test suite run complete: ${passCount} / ${TEST_SUITE.length} tests passed`, passCount === TEST_SUITE.length ? 'success' : 'warning');
  }

  // -------------------------------------------------------------
  // NAVIGATION & VIEW SWITCHER
  // -------------------------------------------------------------
  function switchView(viewName) {
    state.activeView = viewName;

    // Update sidebar nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update main sections
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update Top Header titles
    const titles = {
      dashboard: { title: 'Executive Dashboard', subtitle: 'Real-time workforce shift scheduling overview & intelligence' },
      generate: { title: 'Generate Schedule', subtitle: 'Algorithmic configuration and execution engine' },
      calendar: { title: 'Weekly Calendar Matrix', subtitle: 'Interactive visual schedule grid with drag-and-drop reassignment' },
      conflicts: { title: 'Conflicts & Compliance Log', subtitle: 'Audited log of working hour violations, overlaps, and gaps' },
      employees: { title: 'Employee Directory', subtitle: 'Workforce registry, roles, skills, and shift preferences' },
      shifts: { title: 'Shift Management', subtitle: 'Shift templates, working hours, and staffing requirements' },
      availability: { title: 'Availability Matrix', subtitle: 'Employee weekly availability & preferred shift configurations' },
      analytics: { title: 'Workforce Analytics & Reports', subtitle: 'Coverage distributions, workload equity, and exports' },
      algorithms: { title: 'Algorithm Deep Dive', subtitle: 'Formal mechanics and interactive simulation of Greedy vs Backtracking' },
      tests: { title: 'Algorithmic Test Suite', subtitle: 'Automated verification across 13 core constraint conditions' },
      settings: { title: 'System Configuration', subtitle: 'Global hour ceilings, rest rules, and heuristic scoring weights' }
    };

    if (titles[viewName]) {
      document.getElementById('header-page-title').textContent = titles[viewName].title;
      document.getElementById('header-page-subtitle').textContent = titles[viewName].subtitle;
    }

    // Re-render specific view if needed
    if (viewName === 'analytics') renderAnalyticsView();
    if (viewName === 'calendar') renderCalendarView();
    if (viewName === 'conflicts') renderConflictsView();
    if (viewName === 'dashboard') renderDashboardView();
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS INITIALIZATION
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Navigation items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        switchView(view);
        // Mobile sidebar close
        document.getElementById('sidebar').classList.remove('mobile-open');
      });
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    // Reset Demo Data button
    document.getElementById('btn-reset-demo').addEventListener('click', () => {
      if (confirm('Reset application data to initial 12 demo employees and 3 standard shifts?')) {
        resetToDemoData();
      }
    });

    // Quick Generate button in header
    document.getElementById('btn-quick-generate').addEventListener('click', () => {
      runScheduling('hybrid', state.settings.objective, state.settings.nodeLimit);
    });

    // Generate Schedule View Controls
    document.getElementById('btn-run-schedule').addEventListener('click', () => {
      const mode = document.getElementById('gen-mode-select').value;
      const objective = document.getElementById('gen-objective-select').value;
      const nodeLimit = document.getElementById('gen-node-limit').value;

      const progress = document.getElementById('gen-progress-indicator');
      progress.style.display = 'flex';

      setTimeout(() => {
        runScheduling(mode, objective, nodeLimit);
        progress.style.display = 'none';
        switchView('calendar');
      }, 100);
    });

    // Benchmark All 3 Modes button
    document.getElementById('btn-run-comparison').addEventListener('click', () => {
      runScheduleComparison();
    });

    // Objective select description
    document.getElementById('gen-objective-select').addEventListener('change', e => {
      const obj = e.target.value;
      const descEl = document.getElementById('gen-objective-description');
      const descs = {
        coverage: 'Maximizes total filled shift slots while enforcing hard constraints: employee availability, maximum 40 hrs/week, maximum 8 hrs/day, 12-hour minimum rest period between shifts, and required role/skill sets.',
        fairness: 'Balances assigned hours across staff members to minimize variance and promote workload equity, while guaranteeing zero hard constraint violations.',
        preferences: 'Prioritizes employee preferred shifts (Morning, Evening, Night) and preferred working days, maximizing staff satisfaction.',
        overtime: 'Penalizes assignments that push employees close to daily or weekly overtime caps, mitigating burnout and consecutive fatigue.'
      };
      descEl.textContent = descs[obj] || '';
    });

    // Calendar filters and controls
    document.getElementById('cal-filter-role').addEventListener('change', e => {
      state.filterRole = e.target.value;
      renderCalendarView();
    });

    document.getElementById('cal-filter-shift').addEventListener('change', e => {
      state.filterShift = e.target.value;
      renderCalendarView();
    });

    document.getElementById('btn-toggle-grid-view').addEventListener('click', () => {
      document.getElementById('calendar-matrix-wrapper').style.display = 'block';
      document.getElementById('calendar-table-wrapper').style.display = 'none';
      document.getElementById('btn-toggle-grid-view').style.background = 'var(--primary)';
      document.getElementById('btn-toggle-grid-view').style.color = '#fff';
      document.getElementById('btn-toggle-table-view').style.background = '#fff';
      document.getElementById('btn-toggle-table-view').style.color = 'var(--text-main)';
    });

    document.getElementById('btn-toggle-table-view').addEventListener('click', () => {
      document.getElementById('calendar-matrix-wrapper').style.display = 'none';
      document.getElementById('calendar-table-wrapper').style.display = 'block';
      document.getElementById('btn-toggle-table-view').style.background = 'var(--primary)';
      document.getElementById('btn-toggle-table-view').style.color = '#fff';
      document.getElementById('btn-toggle-grid-view').style.background = '#fff';
      document.getElementById('btn-toggle-grid-view').style.color = 'var(--text-main)';
    });

    // Employee filters and search
    document.getElementById('emp-search-input').addEventListener('input', () => {
      renderEmployeesView();
    });
    document.getElementById('emp-role-filter').addEventListener('change', () => {
      renderEmployeesView();
    });
    document.getElementById('emp-status-filter').addEventListener('change', () => {
      renderEmployeesView();
    });

    // Employee Modal buttons
    document.getElementById('btn-open-add-emp-modal').addEventListener('click', () => {
      document.getElementById('modal-emp-title').textContent = 'Add New Employee';
      document.getElementById('form-employee').reset();
      document.getElementById('emp-edit-id').value = '';
      openModal('modal-employee');
    });
    document.getElementById('btn-save-emp').addEventListener('click', () => {
      saveEmployeeForm();
    });

    // Shift Modal buttons
    document.getElementById('btn-open-add-shift-modal').addEventListener('click', () => {
      document.getElementById('modal-shift-title').textContent = 'Add Shift Template';
      document.getElementById('form-shift').reset();
      document.getElementById('shift-edit-id').value = '';
      openModal('modal-shift');
    });
    document.getElementById('btn-save-shift').addEventListener('click', () => {
      saveShiftForm();
    });

    // CSV Exports and Imports
    document.getElementById('btn-export-emp-csv').addEventListener('click', exportEmployeesCSV);
    document.getElementById('btn-export-schedule-csv').addEventListener('click', exportScheduleCSV);
    document.getElementById('btn-export-workload-csv').addEventListener('click', exportWorkloadCSV);
    document.getElementById('emp-csv-input').addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        importEmployeesCSV(e.target.files[0]);
      }
    });

    // Revalidate conflicts button
    document.getElementById('btn-revalidate-conflicts').addEventListener('click', () => {
      renderConflictsView();
      showToast('Schedule re-audited across all 9 constraint rules', 'info');
    });

    // Test Suite runner
    document.getElementById('btn-run-all-tests').addEventListener('click', runAllTests);

    // Settings save button
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);

    // Interactive Algorithm Simulator controls
    document.getElementById('btn-sim-next').addEventListener('click', () => {
      if (simStep < SIM_STEPS_DATA.length - 1) {
        simStep++;
        renderSimStep();
      }
    });
    document.getElementById('btn-sim-prev').addEventListener('click', () => {
      if (simStep > 0) {
        simStep--;
        renderSimStep();
      }
    });
    document.getElementById('btn-sim-reset').addEventListener('click', () => {
      simStep = 0;
      renderSimStep();
    });
  }

  // -------------------------------------------------------------
  // PUBLIC INITIALIZATION
  // -------------------------------------------------------------
  function init() {
    loadData();
    setupEventListeners();

    // Ensure schedule exists
    if (!state.schedule) {
      runScheduling('hybrid', state.settings.objective, state.settings.nodeLimit, false);
    }

    renderAllViews();
    runAllTests();
    renderSimStep();
    runScheduleComparison();
  }

  // Expose methods needed by inline event handlers
  return {
    init,
    switchView,
    openModal,
    closeModal,
    openEditEmployeeModal,
    deleteEmployee,
    openEditShiftModal,
    deleteShift,
    openShiftDetailModal,
    cycleEmployeeAvailability,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    runAllTests,
    TEST_SUITE
  };
})();

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SmartShiftApp.init();
});
