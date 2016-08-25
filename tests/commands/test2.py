import click


@click.command('test')
@click.argument('arg1', nargs=-1)
@click.option('-v', '--verbosity', required=False)
@click.option('--fake-initial', default=False)
def test(arg1, fake_initial, **kwargs):
    print('test', kwargs)

test()
