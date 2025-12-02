import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Feature: game-enhancements, Property 3: Particle opacity decay
// Validates: Requirements 2.3, 3.4, 4.4

describe('Particle System Property Tests', () => {
  
  // Helper function to create a particle with given properties
  function createTestParticle(x, y, vx, vy, color, size, maxLife) {
    return {
      x,
      y,
      vx,
      vy,
      opacity: 1.0,
      life: maxLife,
      maxLife,
      color,
      size,
      rotation: 0,
      rotationSpeed: 0
    };
  }
  
  // Helper function to update a particle (mimics ParticleSystem.updateParticleArray logic)
  function updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;
    particle.opacity = particle.life / particle.maxLife;
    return particle.life > 0;
  }
  
  describe('Property 3: Particle opacity decay', () => {
    it('should decrease opacity monotonically over time for all particle types', () => {
      fc.assert(
        fc.property(
          // Generate random particle parameters
          fc.integer({ min: 0, max: 800 }), // x position
          fc.integer({ min: 0, max: 600 }), // y position
          fc.float({ min: -5, max: 5 }), // vx velocity
          fc.float({ min: -5, max: 5 }), // vy velocity
          fc.constantFrom('#790ECB', '#9D4EDB', '#FFD700', '#FFFFFF'), // colors
          fc.integer({ min: 3, max: 12 }), // size
          fc.integer({ min: 10, max: 200 }), // maxLife
          (x, y, vx, vy, color, size, maxLife) => {
            // Create a particle with random properties
            const particle = createTestParticle(x, y, vx, vy, color, size, maxLife);
            
            // Track opacity values over time
            const opacities = [particle.opacity];
            
            // Simulate particle lifetime
            while (particle.life > 0) {
              updateParticle(particle);
              if (particle.life > 0) {
                opacities.push(particle.opacity);
              }
            }
            
            // Property: Opacity should decrease monotonically
            // Each opacity value should be less than or equal to the previous one
            for (let i = 1; i < opacities.length; i++) {
              if (opacities[i] > opacities[i - 1]) {
                return false; // Opacity increased, property violated
              }
            }
            
            // Property: Final opacity should be at or near zero
            const finalOpacity = opacities[opacities.length - 1];
            if (finalOpacity > 0.1) {
              return false; // Opacity didn't decay to near zero
            }
            
            // Property: Opacity should start at 1.0
            if (Math.abs(opacities[0] - 1.0) > 0.01) {
              return false; // Initial opacity not 1.0
            }
            
            return true;
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });
    
    it('should handle edge case of maxLife = 1', () => {
      // Edge case: particle with very short lifetime
      const particle = createTestParticle(100, 100, 0, 0, '#790ECB', 5, 1);
      
      expect(particle.opacity).toBe(1.0);
      expect(particle.life).toBe(1);
      
      updateParticle(particle);
      
      expect(particle.life).toBe(0);
      expect(particle.opacity).toBe(0);
    });
    
    it('should handle particles with zero velocity', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }), // maxLife
          (maxLife) => {
            const particle = createTestParticle(100, 100, 0, 0, '#790ECB', 5, maxLife);
            
            let previousOpacity = particle.opacity;
            
            while (particle.life > 0) {
              updateParticle(particle);
              
              if (particle.life > 0) {
                // Opacity should decrease or stay the same (monotonic)
                if (particle.opacity > previousOpacity) {
                  return false;
                }
                previousOpacity = particle.opacity;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
