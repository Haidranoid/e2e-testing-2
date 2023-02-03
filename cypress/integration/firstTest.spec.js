describe('Test with backend', function () {
  beforeEach('login to the app', () => {
    cy.server()
    cy.route('GET', '**/tags', 'fixture:tags.json')
    cy.loginToApplication()
  })

  it('should be logged in', () => {
    cy.log('Yeeey we logged in!')
  })

  it('should verify correct request and response', function () {
    cy.server()
    cy.route('POST', '**/articles')
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
    cy.get('@postArticles')
      .then(xhr => {
        console.log(xhr)
        expect(xhr.status).to.equal(200)
        expect(xhr.request.body.article.body).to.equal('This is a body of the Article')
        expect(xhr.response.body.article.description).to.equal('This is a description')
      })
  });

  it('should gave tags with with routing object', function () {
    cy.get('.tag-list')
      .should('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  });

  it('should verify global feed likes count', function () {
    cy.route('GET', '**/articles/feed', '{"articles":[],"articlesCount":0}')
    cy.route('GET', '**/articles*', 'fixture:articles.json')

    cy.contains('Global Feed').click()
    cy.get('app-article-list button')
      .then(buttons => {
        expect(buttons[0]).to.contain('10')
        expect(buttons[1]).to.contain('5')
      })

    cy.fixture('articles')
      .then(file => {
        const articleLink = file.articles[1].slug

        cy.route('POST', `**/articles/${articleLink}/favorite`, file)
      })

    cy.get('app-article-list button')
      .eq(1)
      .click()
      .should('contain', '6')
  });

  it.only('should delete a new article in a global feed', function () {

    const bodyRequest = {
      "article": {
        "taglist": [],
        "title": "Request from API 2-4",
        "description": "API testing is easy",
        "body": "Angular is cool"
      }
    }

    cy.get('@token').then(token => {

      cy.request({
        url: Cypress.env('apiUrl') + 'api/articles/',
        headers: {
          "Authorization": `Token ${token}`,
          "Content-type": "application/json",
          "Accept": "*/*"
        },
        method: "POST",
        body: bodyRequest
      }).then(response => {
        expect(response.status).to.equal(200)
      })
      cy.contains('Global Feed').click()
      cy.get('.article-preview').first().click()
      cy.get('.article-actions')
        .contains('Delete Article')
        .click()

      cy.request({
        url: Cypress.env('apiUrl') + 'api/articles?limit=10&offset=0',
        headers: {
          "Authorization": `Token ${token}`
        },
        method: "GET"
      }).its('body').then(body => {
        //console.log(body)
        expect(body.articles[0].title).not.to.equal(bodyRequest.article.title)
      })
    })
  });
});
