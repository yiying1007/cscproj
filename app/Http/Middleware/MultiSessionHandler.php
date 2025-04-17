<?php

namespace App\Http\Middleware;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Container\BindingResolutionException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Session\DatabaseSessionHandler;

class MultiSessionHandler extends DatabaseSessionHandler
{
    public function write($sessionId, $data): bool
    {
        // Manually prepare basic session data
        $payload = $this->preparePayload($data);

        // Add user and guard information
        $this->addUserInformation($payload);

        //  Serialize the payload back into a string
        $serializedPayload = serialize($payload);

        // Invoke the parent class's write logic, passing the serialized $serializedPayload.
        return parent::write($sessionId, $serializedPayload);
    }


    //Add user and guard information to the session payload.
    protected function addUserInformation(&$payload): static
    {
        foreach (array_keys(config('auth.guards')) as $guard) {
            if (Auth::guard($guard)->check()) {
                //Add the guard name--admin,user
                $payload['guard'] = $guard;
                //Add id --admin,user
                $payload['user_id'] = Auth::guard($guard)->id();
                break;
            }
        }
        
        //info("Guard: {$payload['guard']}, User ID: {$payload['user_id']}");

        return $this;
    }
    //Prepare the payload for the session
    protected function preparePayload(string $data): array
    {
        // Unserialize the session data (if possible)
        $unserializedData = @unserialize($data);

        // If deserialization fails, return an empty array; otherwise, return the deserialized data
        $preparedData = is_array($unserializedData) ? $unserializedData : [];

        // Add special fields in a Laravel session
        $preparedData += [
            '_previous' => session()->get('_previous', []),
            '_flash' => session()->get('_flash', []),
            '_token' => session()->get('_token'),
        ];

        return $preparedData;
    }

    

    protected function user(): mixed
    {
        return $this->container->make(Guard::class)->user();
    }
}
