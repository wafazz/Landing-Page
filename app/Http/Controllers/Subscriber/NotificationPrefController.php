<?php

namespace App\Http\Controllers\Subscriber;

use App\Http\Controllers\Controller;
use App\Models\UserNotificationPref;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPrefController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $prefs = UserNotificationPref::where('user_id', $user->id)->get()->keyBy('event');

        $rows = [];
        foreach (NotificationService::EVENTS as $event => $label) {
            $row = $prefs->get($event);
            $rows[] = [
                'event' => $event,
                'label' => $label,
                'email_enabled' => $row?->email_enabled ?? true,
                'whatsapp_enabled' => $row?->whatsapp_enabled ?? true,
            ];
        }

        return Inertia::render('subscriber/notification-prefs/index', [
            'prefs' => $rows,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'event' => ['required', 'string'],
            'email_enabled' => ['required', 'boolean'],
            'whatsapp_enabled' => ['required', 'boolean'],
        ]);

        if (! array_key_exists($data['event'], NotificationService::EVENTS)) {
            return back()->with('error', 'Invalid event.');
        }

        UserNotificationPref::updateOrCreate(
            ['user_id' => $request->user()->id, 'event' => $data['event']],
            ['email_enabled' => $data['email_enabled'], 'whatsapp_enabled' => $data['whatsapp_enabled']],
        );

        return back()->with('success', 'Preferences updated.');
    }
}
