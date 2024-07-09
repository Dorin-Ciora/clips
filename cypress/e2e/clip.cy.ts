describe('Clip', () => {
  it('should play clip', () => {
    cy.visit('/');
    cy.get('app-clips-list > .grid a:first').click();

    // Wait for the video element to be visible
    cy.get('.video-js > video', { timeout: 10000 }).should('be.visible');

    // Click the play button
    cy.get('.vjs-big-play-button').click();

    cy.wait(3000);

    // Pause the video by clicking on it
    cy.get('.video-js > video').click();

    // Assert that the video has played for at least some time
    cy.get('.vjs-play-progress').invoke('width').should('be.gte', 0);
  });
});
