<?php

it('returns a successful response', function () {
    //no compiled frontend is needed to test the backend
    $this->withoutVite();

    $response = $this->get('/');

    $response->assertStatus(200);
});
