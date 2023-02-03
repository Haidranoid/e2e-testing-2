describe.skip('Test with backend', function () {
  beforeEach('login to the app', () => {
    cy.intercept({method: 'GET', path: 'tags'}, {fixture: 'tags.json'})
    cy.loginToApplication()
  })

  it('should be logged in', () => {
    cy.log('Yeeey we logged in!')
  })

  it('should verify correct request and response', function () {
    cy.intercept({method: 'POST', path: '**/articles'})
      .as('postArticles')

    cy.contains('New Article').click()

    cy.get('[formcontrolname="title"]')
      .type('This is a title 3')

    cy.get('[formcontrolname="description"]')
      .type('This is a description')

    cy.get('[formcontrolname="body"]')
      .type('This is a body of the Article')

    cy.contains('Publish Article').click()


    cy.wait('@postArticles')
      .then(interception => {
        const {response} = interception

        expect(response.statusCode).to.equal(200)
        expect(response.body.article.body).to.equal('This is a body of the Article')
        expect(response.body.article.description).to.equal('This is a description')
      })
  });

  it.only('should intercept and modify the request and response', function () {
    cy.intercept({method: 'POST', path: '**/articles'}, (req) => {
      req.body.article.description = "This a description 20"
    }).as('postArticles')

    cy.contains('New Article').click()

    cy.get('[formcontrolname="title"]')
      .type('This is a title 3')

    cy.get('[formcontrolname="description"]')
      .type('This is a description')

    cy.get('[formcontrolname="body"]')
      .type('This is a body of the Article')

    cy.contains('Publish Article').click()


    cy.wait('@postArticles')
      .then(interception => {
        const {response} = interception

        expect(response.statusCode).to.equal(200)
        expect(response.body.article.body).to.equal('This is a body of the Article')
        expect(response.body.article.description).to.equal('This is a description')
      })
  });


  it('should gave tags with with routing object', function () {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  });

  it('should verify global feed likes count', function () {
    cy.intercept('GET', '**/articles/feed', {"articles": [], "articlesCount": 0})
    cy.intercept('GET', '**/articles*', {fixture: 'articles.json'})

    cy.contains('Global Feed').click()
    cy.get('app-article-list button')
      .then(buttons => {
        expect(buttons[0]).to.contain('10')
        expect(buttons[1]).to.contain('5')
      })

    cy.fixture('articles')
      .then(file => {
        const articleLink = file.articles[1].slug

        cy.intercept('POST', `**/articles/${articleLink}/favorite`, file)
      })

    cy.get('app-article-list button')
      .eq(1)
      .click()
      .should('contain', '6')
  });
});
