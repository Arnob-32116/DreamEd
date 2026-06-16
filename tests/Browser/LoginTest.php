<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    /** @test */
    public function user_can_login_with_valid_credentials()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', 'valid@example.com')
                    ->type('password', 'secret123')
                    ->press('Login')
                    ->assertPathIs('/dashboard');
        });
    }

    /** @test */
    public function test_multiple_login_attempts()
    {
        $users = [
            ['email' => 'valid@example.com', 'password' => 'secret123'],
            ['email' => 'invalid@example.com', 'password' => 'wrongpass'],
            ['email' => '', 'password' => ''],
        ];

        foreach ($users as $user) {
            $this->browse(function (Browser $browser) use ($user) {
                $browser->visit('/login')
                        ->type('email', $user['email'])
                        ->type('password', $user['password'])
                        ->press('Login')
                        ->pause(1000);
            });
        }
    }
}