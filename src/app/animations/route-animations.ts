import {
  animate,
  group,
  query,
  style,
  transition,
  trigger,
  AnimationMetadata,
} from '@angular/animations';

function slideTransition(
  from: string,
  to: string,
  direction: 'left' | 'right'
): AnimationMetadata {
  const enterTransform =
    direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
  const leaveTransform =
    direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';

  return transition(`${from} => ${to}`, [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ transform: enterTransform, opacity: 1 })], {
      optional: true,
    }),
    group([
      query(
        ':leave',
        [animate('400ms ease', style({ transform: leaveTransform }))],
        {
          optional: true,
        }
      ),
      query(
        ':enter',
        [animate('400ms ease', style({ transform: 'translateX(0)' }))],
        {
          optional: true,
        }
      ),
    ]),
  ]);
}

export const slideInAnimation = trigger('routeAnimations', [
  slideTransition('HomePage', '*', 'left'),
  slideTransition('*', 'HomePage', 'right'),
  slideTransition('AboutPage', '*', 'left'),
  slideTransition('WorksPage', 'ContactPage', 'left'),
  slideTransition('WorksPage', '*', 'right'),
  slideTransition('ContactPage', '*', 'right'),
]);
